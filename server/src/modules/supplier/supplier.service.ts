import * as repository from './supplier.repository';
import {
  toSupplierListResponse,
  toSupplierResponse,
} from './supplier.mapper';
import type {
  CreateSupplierInput,
  ListSuppliersQuery,
  UpdateSupplierInput,
} from './supplier.validation';
import type { ListSuppliersResult } from './supplier.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';

export const createSupplier = async (
  organizationId: string,
  payload: CreateSupplierInput,
) => {
  const supplier = await repository.create(organizationId, payload);
  return toSupplierResponse(supplier);
};

export const getSuppliers = async (
  organizationId: string,
  query: ListSuppliersQuery,
): Promise<ListSuppliersResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    status?: NonNullable<ListSuppliersQuery['status']>;
  } = {};

  if (query.search) filters.search = query.search;
  if (query.status !== undefined) filters.status = query.status;

  const [suppliers, total] = await repository.findMany(
    organizationId,
    filters,
    skip,
    limit,
  );

  return {
    suppliers: toSupplierListResponse(suppliers),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getSupplierById = async (
  organizationId: string,
  id: string,
) => {
  const supplier = await repository.findById(organizationId, id);

  if (!supplier) {
    throw new AppError('Supplier not found.', HTTP_STATUS.NOT_FOUND);
  }

  return toSupplierResponse(supplier);
};

export const updateSupplier = async (
  organizationId: string,
  id: string,
  payload: UpdateSupplierInput,
) => {
  const supplier = await repository.findById(organizationId, id);

  if (!supplier) {
    throw new AppError('Supplier not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError(
      'At least one field is required.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const updated = await repository.update(id, payload);
  return toSupplierResponse(updated);
};

export const deleteSupplier = async (
  organizationId: string,
  id: string,
) => {
  const supplier = await repository.findById(organizationId, id);

  if (!supplier) {
    throw new AppError('Supplier not found.', HTTP_STATUS.NOT_FOUND);
  }

  await repository.softDelete(id);

  return {
    message: 'Supplier deactivated successfully.',
  };
};
