import { ZodError, ZodType } from 'zod';
import { Request, Response, NextFunction } from 'express';

import { AppError } from '../errors/app-error';
import { HTTP_STATUS } from '../constants/http-status';

type ParsedRequest = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
};

const assignRequestProperty = (
  req: Request,
  key: 'body' | 'query' | 'params',
  value: unknown,
): void => {
  try {
    (req as unknown as Record<string, unknown>)[key] = value;
  } catch {
    Object.defineProperty(req, key, {
      value,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
};

export const validate =
  (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as ParsedRequest;

      if (parsed.body !== undefined) {
        assignRequestProperty(req, 'body', parsed.body);
      }

      if (parsed.query !== undefined) {
        assignRequestProperty(req, 'query', parsed.query);
      }

      if (parsed.params !== undefined) {
        assignRequestProperty(req, 'params', parsed.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppError(
            'Validation failed',
            HTTP_STATUS.BAD_REQUEST,
            error.flatten().fieldErrors,
          ),
        );
        return;
      }

      next(error);
    }
  };
