import { NextFunction, Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { AppError } from '../errors/app-error';
import { HTTP_STATUS } from '../constants/http-status';
import { prisma } from '../database';
import { verifyAccessToken } from '../security/jwt';

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
        role: true,
        status: true,
        isEmailVerified: true,
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

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize =
  (...roles: UserRole[]) =>
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

      if (!roles.includes(req.user.role)) {
        return next(
          new AppError(
            'You do not have permission to perform this action.',
            HTTP_STATUS.FORBIDDEN,
          ),
        );
      }

      next();
    };