import type { ApiSuccess, PaginatedResult, PaginationMeta } from './types';

const EMPTY_META: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export function unwrapList<T>(
  response: ApiSuccess<T[]>,
): PaginatedResult<T> {
  return {
    items: response.data ?? [],
    meta: response.meta ?? EMPTY_META,
  };
}

export function unwrapData<T>(response: ApiSuccess<T>): T {
  return response.data;
}
