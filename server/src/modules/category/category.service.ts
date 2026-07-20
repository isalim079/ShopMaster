import * as repository from './category.repository';
import {
  toCategoryListResponse,
  toCategoryResponse,
} from './category.mapper';
import type {
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from './category.validation';
import type { ListCategoriesResult } from './category.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';

export const createCategory = async (
  organizationId: string,
  payload: CreateCategoryInput,
) => {
  const existing = await repository.findByName(organizationId, payload.name);
  if (existing) {
    throw new AppError(
      'Category with this name already exists.',
      HTTP_STATUS.CONFLICT,
    );
  }

  if (payload.parentId) {
    const parent = await repository.findById(organizationId, payload.parentId);
    if (!parent) {
      throw new AppError('Parent category not found.', HTTP_STATUS.BAD_REQUEST);
    }
  }

  const category = await repository.create(organizationId, payload);
  return toCategoryResponse(category);
};

export const getCategories = async (
  organizationId: string,
  query: ListCategoriesQuery,
): Promise<ListCategoriesResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    status?: NonNullable<ListCategoriesQuery['status']>;
  } = {};

  if (query.search) filters.search = query.search;
  if (query.status !== undefined) filters.status = query.status;

  const [categories, total] = await repository.findMany(
    organizationId,
    filters,
    skip,
    limit,
  );

  return {
    categories: toCategoryListResponse(categories),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getCategoryById = async (
  organizationId: string,
  id: string,
) => {
  const category = await repository.findById(organizationId, id);

  if (!category) {
    throw new AppError('Category not found.', HTTP_STATUS.NOT_FOUND);
  }

  return toCategoryResponse(category);
};

export const updateCategory = async (
  organizationId: string,
  id: string,
  payload: UpdateCategoryInput,
) => {
  const category = await repository.findById(organizationId, id);

  if (!category) {
    throw new AppError('Category not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError(
      'At least one field is required.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (payload.name !== undefined && payload.name !== category.name) {
    const existing = await repository.findByName(organizationId, payload.name);
    if (existing) {
      throw new AppError(
        'Category with this name already exists.',
        HTTP_STATUS.CONFLICT,
      );
    }
  }

  if (payload.parentId) {
    if (payload.parentId === id) {
      throw new AppError(
        'Category cannot be its own parent.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    const parent = await repository.findById(organizationId, payload.parentId);
    if (!parent) {
      throw new AppError('Parent category not found.', HTTP_STATUS.BAD_REQUEST);
    }
  }

  const updated = await repository.update(id, payload);
  return toCategoryResponse(updated);
};

export const deleteCategory = async (
  organizationId: string,
  id: string,
) => {
  const category = await repository.findById(organizationId, id);

  if (!category) {
    throw new AppError('Category not found.', HTTP_STATUS.NOT_FOUND);
  }

  await repository.softDelete(id);

  return {
    message: 'Category deactivated successfully.',
  };
};
