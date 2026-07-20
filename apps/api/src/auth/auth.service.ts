import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { randomBytes } from 'crypto';
import {
  LoginDto,
  VerifyOtpDto,
  VerifyTotpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ResendOtpDto,
} from './dto/auth.dto';

const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

interface PendingAuth {
  userId: string;
  step: 'email_otp' | 'totp_verify' | 'totp_enroll';
  expiresAt: number;
}
const pendingAuthStore = new Map<string, PendingAuth>();

interface ResetToken {
  userId: string;
  expiresAt: number;
}
const resetTokenStore = new Map<string, ResetToken>();

function generatePendingToken(): string {
  return randomBytes(32).toString('hex');
}

function generateNumericOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.identifier.toLowerCase() },
          { username: dto.identifier.toLowerCase() },
        ],
      },
      include: { organization: true },
    });

    const invalidError = new UnauthorizedException('Invalid credentials');
    if (!user) throw invalidError;

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Account temporarily locked. Please try again later.');
    }

    if (!user.isActive) throw new ForbiddenException('Account is disabled.');

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      const attempts = user.failedLoginAttempts + 1;
      const lockedUntil = attempts >= LOCKOUT_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;
      await this.prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: attempts, lockedUntil } });
      throw invalidError;
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });

    if (user.mfaPolicy === 'none') return this.issueSessionToken(user);

    if (user.mfaPolicy === 'email_otp') {
      await this.sendEmailOtp(user.id);
      const pendingToken = generatePendingToken();
      pendingAuthStore.set(pendingToken, { userId: user.id, step: 'email_otp', expiresAt: Date.now() + 10 * 60 * 1000 });
      return { requiresMfa: true, mfaType: 'email_otp', pendingToken };
    }

    if (user.mfaPolicy === 'google_auth') {
      const pendingToken = generatePendingToken();
      if (!user.totpEnabled) {
        pendingAuthStore.set(pendingToken, { userId: user.id, step: 'totp_enroll', expiresAt: Date.now() + 10 * 60 * 1000 });
        return { requiresMfa: true, mfaType: 'totp_enroll', pendingToken };
      }
      pendingAuthStore.set(pendingToken, { userId: user.id, step: 'totp_verify', expiresAt: Date.now() + 10 * 60 * 1000 });
      return { requiresMfa: true, mfaType: 'totp_verify', pendingToken };
    }

    return this.issueSessionToken(user);
  }

  private async sendEmailOtp(userId: string) {
    const otp = generateNumericOtp();
    const expiry = new Date(Date.now() + OTP_EXPIRY_MS);
    await this.prisma.user.update({ where: { id: userId }, data: { emailOtp: otp, emailOtpExpiry: expiry, emailOtpAttempts: 0 } });
    console.log(`[EMAIL OTP] User ${userId} — OTP: ${otp}`);
  }

  async verifyEmailOtp(dto: VerifyOtpDto) {
    const pending = this.getPendingAuth(dto.pendingToken, 'email_otp');
    const user = await this.prisma.user.findUnique({ where: { id: pending.userId } });
    if (!user || !user.emailOtp || !user.emailOtpExpiry) throw new BadRequestException('OTP not found.');
    if (user.emailOtpAttempts >= OTP_MAX_ATTEMPTS) throw new ForbiddenException('Too many attempts.');
    if (user.emailOtpExpiry < new Date()) throw new BadRequestException('OTP has expired.');
    if (user.emailOtp !== dto.otp) {
      await this.prisma.user.update({ where: { id: user.id }, data: { emailOtpAttempts: { increment: 1 } } });
      throw new UnauthorizedException('Invalid OTP.');
    }
    await this.prisma.user.update({ where: { id: user.id }, data: { emailOtp: null, emailOtpExpiry: null, emailOtpAttempts: 0 } });
    pendingAuthStore.delete(dto.pendingToken);
    return this.issueSessionToken(user);
  }

  async resendOtp(dto: ResendOtpDto) {
    const pending = this.getPendingAuth(dto.pendingToken, 'email_otp');
    const user = await this.prisma.user.findUnique({ where: { id: pending.userId } });
    if (!user) throw new UnauthorizedException();
    if (user.emailOtpExpiry) {
      const sentAt = new Date(user.emailOtpExpiry.getTime() - OTP_EXPIRY_MS);
      if (Date.now() - sentAt.getTime() < OTP_COOLDOWN_MS) throw new BadRequestException('Please wait before requesting a new OTP.');
    }
    await this.sendEmailOtp(user.id);
    return { message: 'OTP resent successfully.' };
  }

  async getTotpEnrollment(pendingToken: string) {
    const pending = this.getPendingAuth(pendingToken, 'totp_enroll');
    const user = await this.prisma.user.findUnique({ where: { id: pending.userId } });
    if (!user) throw new UnauthorizedException();
    let secret = user.totpSecret;
    if (!secret) {
      secret = speakeasy.generateSecret({ name: 'FosterKonnect' }).base32;
      await this.prisma.user.update({ where: { id: user.id }, data: { totpSecret: secret } });
    }
    const otpauth = speakeasy.otpauthURL({ secret, label: user.email, issuer: 'FosterKonnect', encoding: 'base32' });
    const qrDataUrl = await qrcode.toDataURL(otpauth);
    return { qrDataUrl, secret };
  }

  async verifyTotpEnrollment(dto: VerifyTotpDto) {
    const pending = this.getPendingAuth(dto.pendingToken, 'totp_enroll');
    const user = await this.prisma.user.findUnique({ where: { id: pending.userId } });
    if (!user || !user.totpSecret) throw new UnauthorizedException();
    const isValid = speakeasy.totp.verify({ secret: user.totpSecret, encoding: 'base32', token: dto.code, window: 1 });
    if (!isValid) throw new UnauthorizedException('Invalid authenticator code.');
    await this.prisma.user.update({ where: { id: user.id }, data: { totpEnabled: true } });
    pendingAuthStore.delete(dto.pendingToken);
    return this.issueSessionToken(user);
  }

  async verifyTotp(dto: VerifyTotpDto) {
    const pending = this.getPendingAuth(dto.pendingToken, 'totp_verify');
    const user = await this.prisma.user.findUnique({ where: { id: pending.userId } });
    if (!user || !user.totpSecret) throw new UnauthorizedException();
    const isValid = speakeasy.totp.verify({ secret: user.totpSecret, encoding: 'base32', token: dto.code, window: 1 });
    if (!isValid) throw new UnauthorizedException('Invalid authenticator code.');
    pendingAuthStore.delete(dto.pendingToken);
    return this.issueSessionToken(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({ where: { email: dto.email.toLowerCase() } });
    if (!user) return { message: 'If an account exists for this email, reset instructions have been sent.' };
    const token = randomBytes(32).toString('hex');
    resetTokenStore.set(token, { userId: user.id, expiresAt: Date.now() + 60 * 60 * 1000 });
    console.log(`[RESET PASSWORD] Link: http://localhost:3000/auth?token=${token}`);
    return { message: 'If an account exists for this email, reset instructions have been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) throw new BadRequestException('Passwords do not match.');
    const record = resetTokenStore.get(dto.token);
    if (!record || record.expiresAt < Date.now()) throw new BadRequestException('Reset link is invalid or has expired.');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } });
    resetTokenStore.delete(dto.token);
    return { message: 'Password reset successfully.' };
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, firstName: true, lastName: true, role: true, mfaPolicy: true, totpEnabled: true, organization: { select: { id: true, name: true } } },
    });
  }

  async logout(token: string) {
    await this.prisma.session.deleteMany({ where: { token } });
    return { message: 'Logged out.' };
  }

  private getPendingAuth(pendingToken: string, expectedStep: PendingAuth['step']): PendingAuth {
    const pending = pendingAuthStore.get(pendingToken);
    if (!pending || pending.expiresAt < Date.now()) {
      pendingAuthStore.delete(pendingToken);
      throw new UnauthorizedException('Authentication session expired.');
    }
    if (pending.step !== expectedStep) throw new BadRequestException('Invalid authentication step.');
    return pending;
  }

  private async issueSessionToken(user: { id: string; email: string; role: string; firstName: string; lastName: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwt.sign(payload);
    await this.prisma.session.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return { success: true, token, user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, displayName: `${user.firstName} ${user.lastName}` } };
  }
}
