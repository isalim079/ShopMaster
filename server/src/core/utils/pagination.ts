import { Request } from 'express';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export const getPagination = (
  req: Request,
  defaultLimit = 10,
  maxLimit = 100,
): PaginationOptions => {
  const page = Math.max(1, Number(req.query.page) || 1);

  const limit = Math.min(
    maxLimit,
    Math.max(1, Number(req.query.limit) || defaultLimit),
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};