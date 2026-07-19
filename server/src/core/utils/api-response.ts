import { Response } from 'express';

interface ApiResponseOptions<T = unknown> {
  res: Response;
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export const apiResponse = <T = unknown>({
  res,
  statusCode = 200,
  success = true,
  message = 'Success',
  data,
  meta,
}: ApiResponseOptions<T>): Response => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    meta,
  });
};