import * as repository from './brand.repository';
import {
  toBrandListResponse,
  toBrandResponse,
} from './brand.mapper';
import type {
  CreateBrandInput,
  ListBrandsQuery,
  UpdateBrandInput,
} from './brand.validation';
import type { ListBrandsResult } from './brand.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';

export const createBrand = async (
  organizationId: string,
  payload: CreateBrandInput,
) => {
  const existing = await repository.findByName(organizationId, payload.name);
  if (existing) {
    throw new AppError(
      'Brand with this name already exists.',
      HTTP_STATUS.CONFLICT,
    );
  }

  const brand = await repository.create(organizationId, payload);
  return toBrandResponse(brand);
};

export const getBrands = async (
  organizationId: string,
  query: ListBrandsQuery,
): Promise<ListBrandsResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    status?: NonNullable<ListBrandsQuery['status']>;
  } = {};

  if (query.search) filters.search = query.search;
  if (query.status !== undefined) filters.status = query.status;

  const [brands, total] = await repository.findMany(
    organizationId,
    filters,
    skip,
    limit,
  );

  return {
    brands: toBrandListResponse(brands),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getBrandById = async (
  organizationId: string,
  id: string,
) => {
  const brand = await repository.findById(organizationId, id);

  if (!brand) {
    throw new AppError('Brand not found.', HTTP_STATUS.NOT_FOUND);
  }

  return toBrandResponse(brand);
};

export const updateBrand = async (
  organizationId: string,
  id: string,
  payload: UpdateBrandInput,
) => {
  const brand = await repository.findById(organizationId, id);

  if (!brand) {
    throw new AppError('Brand not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError(
      'At least one field is required.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (payload.name !== undefined && payload.name !== brand.name) {
    const existing = await repository.findByName(organizationId, payload.name);
    if (existing) {
      throw new AppError(
        'Brand with this name already exists.',
        HTTP_STATUS.CONFLICT,
      );
    }
  }

  const updated = await repository.update(id, payload);
  return toBrandResponse(updated);
};

export const deleteBrand = async (
  organizationId: string,
  id: string,
) => {
  const brand = await repository.findById(organizationId, id);

  if (!brand) {
    throw new AppError('Brand not found.', HTTP_STATUS.NOT_FOUND);
  }

  await repository.softDelete(id);

  return {
    message: 'Brand deactivated successfully.',
  };
};
