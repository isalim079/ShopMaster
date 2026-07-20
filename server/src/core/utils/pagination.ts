import { Request } from 'express';

import { PAGINATION } from '../constants/pagination';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export const getPagination = (
  req: Request,
  defaultLimit = PAGINATION.DEFAULT_LIMIT,
  maxLimit = PAGINATION.MAX_LIMIT,
): PaginationOptions => {
  const page = Math.max(
    1,
    Number(req.query.page) || PAGINATION.DEFAULT_PAGE,
  );

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