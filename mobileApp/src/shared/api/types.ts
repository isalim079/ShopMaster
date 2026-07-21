export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiFailure {
  success: false;
  message: string;
  details?: unknown;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ListQueryArgs {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

export type ApiError = {
  status: number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'TIMEOUT_ERROR' | 'CUSTOM_ERROR';
  data?: {
    message?: string;
    details?: unknown;
  };
  message?: string;
};
