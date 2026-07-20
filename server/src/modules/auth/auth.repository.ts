import { Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import { ROLE_SLUG } from '../../core/constants/roles';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { env } from '../../core/config/env';
import { slugify } from '../../core/utils/slugify';
import { getDefaultOrganizationSettings } from '../../core/constants/settings';

const userWithRole = {
  role: true,
  organization: true,
} satisfies Prisma.UserInclude;

export const createUser = async (data: {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
  organizationName: string;
}) => {
  const employeeRole = await prisma.role.findUnique({
    where: { slug: ROLE_SLUG.EMPLOYEE },
  });

  if (!employeeRole) {
    throw new AppError(
      'Default employee role is not configured.',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  const { organizationName, ...userData } = data;
  const baseSlug = slugify(organizationName);
  const defaultSettings = getDefaultOrganizationSettings();

  return prisma.$transaction(async (tx) => {
    let slug = baseSlug;
    let suffix = 1;

    while (
      await tx.organization.findUnique({
        where: { slug },
      })
    ) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const organization = await tx.organization.create({
      data: {
        name: organizationName,
        slug,
        currency: env.ORGANIZATION_DEFAULT_CURRENCY,
        timezone: env.ORGANIZATION_DEFAULT_TIMEZONE,
      },
    });

    await tx.organizationSetting.createMany({
      data: defaultSettings.map((setting) => ({
        organizationId: organization.id,
        key: setting.key,
        value: setting.value,
        description: setting.description,
      })),
    });

    return tx.user.create({
      data: {
        ...userData,
        roleId: employeeRole.id,
        organizationId: organization.id,
      },
      include: userWithRole,
    });
  });
};

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    include: userWithRole,
  });
};

export const findUserById = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: userWithRole,
  });
};

export const updateUser = (
  id: string,
  data: Prisma.UserUpdateInput,
) => {
  return prisma.user.update({
    where: { id },
    data,
    include: userWithRole,
  });
};

export const updatePassword = (
  userId: string,
  password: string,
) => {
  return prisma.user.update({
    where: { id: userId },
    data: { password },
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
      user: {
        include: userWithRole,
      },
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

export const getLatestPasswordReset = (
  userId: string,
) => {
  return prisma.passwordReset.findFirst({
    where: {
      userId,
      usedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const markPasswordResetUsed = (
  id: string,
) => {
  return prisma.passwordReset.update({
    where: { id },
    data: {
      usedAt: new Date(),
    },
  });
};

export const deletePendingEmailVerifications = (
  userId: string,
) => {
  return prisma.emailVerification.deleteMany({
    where: {
      userId,
      verifiedAt: null,
    },
  });
};
