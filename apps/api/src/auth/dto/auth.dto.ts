import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @MinLength(1)
  password: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  pendingToken: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class VerifyTotpDto {
  @IsString()
  @IsNotEmpty()
  pendingToken: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class ResendOtpDto {
  @IsString()
  @IsNotEmpty()
  pendingToken: string;
}
