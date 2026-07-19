import { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';
import { AppError } from '../errors/app-error';
import { logger } from '../logger/logger';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error(err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
    });

    return;
  }

  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message,
  });
};