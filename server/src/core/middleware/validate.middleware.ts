import { ZodError, ZodType } from 'zod';
import { Request, Response, NextFunction } from 'express';

import { AppError } from '../errors/app-error';

export const validate =
  (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppError(
            'Validation failed',
            400,
            error.flatten().fieldErrors,
          ),
        );
        return;
      }

      next(error);
    }
  };
