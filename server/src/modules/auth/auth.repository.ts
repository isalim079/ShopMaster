import { prisma } from '../../core/database';
import { User } from '@prisma/client';

export const createUser = (data: {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
}) => {
  return prisma.user.create({
    data,
  });
};

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const updateUser = (
  id: string,
  data: Partial<User>,
) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

export const createEmailVerification = (
  userId: string,
  otpHash: string,
  expiresAt: Date,
) => {
  return prisma.emailVerification.create({
    data: {
      userId,
      otpHash,
      expiresAt,
    },
  });
};

export const getLatestEmailVerification = (
  userId: string,
) => {
  return prisma.emailVerification.findFirst({
    where: {
      userId,
      verifiedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const verifyEmail = (
  verificationId: string,
  userId: string,
) => {
  return prisma.$transaction([
    prisma.emailVerification.update({
      where: {
        id: verificationId,
      },
      data: {
        verifiedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isEmailVerified: true,
        status: 'ACTIVE',
      },
    }),
  ]);
};

export const saveRefreshToken = (
  userId: string,
  tokenHash: string,
  expiresAt: Date,
) => {
  return prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });
};

export const findRefreshToken = (
  tokenHash: string,
) => {
  return prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });
};

export const revokeRefreshToken = (
  tokenHash: string,
) => {
  return prisma.refreshToken.update({
    where: {
      tokenHash,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

export const revokeAllUserTokens = (
  userId: string,
) => {
  return prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

export const createPasswordReset = (
  userId: string,
  otpHash: string,
  expiresAt: Date,
) => {
  return prisma.passwordReset.create({
    data: {
      userId,
      otpHash,
      expiresAt,
    },
  });
};