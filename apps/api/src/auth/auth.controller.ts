import {
  Controller, Post, Get, Body, Req, Res, UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto, VerifyOtpDto, VerifyTotpDto, ForgotPasswordDto, ResetPasswordDto, ResendOtpDto } from './dto/auth.dto';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto);
    if ('token' in result) res.cookie('fk_token', result.token, COOKIE_OPTS);
    return result;
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.verifyEmailOtp(dto);
    res.cookie('fk_token', result.token, COOKIE_OPTS);
    return result;
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  resendOtp(@Body() dto: ResendOtpDto) { return this.auth.resendOtp(dto); }

  @Get('totp-enrollment')
  getTotpEnrollment(@Query('pendingToken') pendingToken: string) { return this.auth.getTotpEnrollment(pendingToken); }

  @Post('verify-totp-enrollment')
  @HttpCode(HttpStatus.OK)
  async verifyTotpEnrollment(@Body() dto: VerifyTotpDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.verifyTotpEnrollment(dto);
    res.cookie('fk_token', result.token, COOKIE_OPTS);
    return result;
  }

  @Post('verify-totp')
  @HttpCode(HttpStatus.OK)
  async verifyTotp(@Body() dto: VerifyTotpDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.verifyTotp(dto);
    res.cookie('fk_token', result.token, COOKIE_OPTS);
    return result;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) { return this.auth.forgotPassword(dto); }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) { return this.auth.resetPassword(dto); }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request & { user: { id: string } }) { return this.auth.getMe(req.user.id); }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request & { cookies: Record<string, string> }, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['fk_token'];
    res.clearCookie('fk_token', { path: '/' });
    return this.auth.logout(token);
  }
}
