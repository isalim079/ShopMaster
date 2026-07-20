import { Organization, Role, User, UserStatus } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type UserWithRole = User & {
  role: Role;
  organization: Organization;
};

export interface LoginResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    role: {
      id: string;
      name: string;
      slug: string;
    };
    organization: {
      id: string;
      name: string;
      slug: string;
    };
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
