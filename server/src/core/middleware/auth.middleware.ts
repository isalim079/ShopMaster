import { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/app-error';
import { HTTP_STATUS } from '../constants/http-status';
import { prisma } from '../database';
import { verifyAccessToken } from '../security/jwt';
import type { RoleSlug } from '../constants/roles';
import { ROLE_SLUG } from '../constants/roles';
import type { PermissionSlug } from '../constants/permissions';
import * as permissionRepository from '../../modules/permission/permission.repository';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const bearerToken = req.headers.authorization?.startsWith(
      'Bearer ',
    )
      ? req.headers.authorization.split(' ')[1]
      : undefined;

    const accessToken =
      bearerToken ?? req.cookies.accessToken;

    if (!accessToken) {
      throw new AppError(
        'Authentication required.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const payload = verifyAccessToken(accessToken);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        email: true,
        status: true,
        isEmailVerified: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            status: true,
          },
        },
        role: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(
        'User not found.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (!user.isEmailVerified) {
      throw new AppError(
        'Email is not verified.',
        HTTP_STATUS.FORBIDDEN,
      );
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError(
        'Account is inactive.',
        HTTP_STATUS.FORBIDDEN,
      );
    }

    if (user.organization.status !== 'ACTIVE') {
      throw new AppError(
        'Organization is inactive.',
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const permissions =
      user.role.slug === ROLE_SLUG.SUPER_ADMIN
        ? ['*']
        : await permissionRepository.findPermissionSlugsByRoleId(
            user.role.id,
          );

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.slug,
      roleId: user.role.id,
      organizationId: user.organizationId,
      permissions,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize =
  (...roles: RoleSlug[]) =>
  (
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return next(
        new AppError(
          'Authentication required.',
          HTTP_STATUS.UNAUTHORIZED,
        ),
      );
    }

    if (!roles.includes(req.user.role as RoleSlug)) {
      return next(
        new AppError(
          'You do not have permission to perform this action.',
          HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    next();
  };

export const requirePermission =
  (...permissions: PermissionSlug[]) =>
  (
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return next(
        new AppError(
          'Authentication required.',
          HTTP_STATUS.UNAUTHORIZED,
        ),
      );
    }

    if (req.user.permissions.includes('*')) {
      return next();
    }

    const hasPermission = permissions.some((permission) =>
      req.user!.permissions.includes(permission),
    );

    if (!hasPermission) {
      return next(
        new AppError(
          'You do not have permission to perform this action.',
          HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    next();
  };
