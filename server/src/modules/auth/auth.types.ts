import { UserRole, UserStatus } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    role: UserRole;
    status: UserStatus;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  tokens: AuthTokens;
}

export interface OtpPayload {
  email: string;
  otp: string;
}

export interface RefreshTokenPayload {
  userId: string;
  refreshToken: string;
}

export interface PasswordResetTokenPayload {
  userId: string;
  email: string;
  type: 'password-reset';
}