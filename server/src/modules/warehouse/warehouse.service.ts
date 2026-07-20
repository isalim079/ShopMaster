import * as repository from './warehouse.repository';
import {
  toWarehouseListResponse,
  toWarehouseResponse,
} from './warehouse.mapper';
import type {
  CreateWarehouseInput,
  ListWarehousesQuery,
  UpdateWarehouseInput,
} from './warehouse.validation';
import type { ListWarehousesResult } from './warehouse.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';

export const createWarehouse = async (
  organizationId: string,
  payload: CreateWarehouseInput,
) => {
  const existing = await repository.findByName(organizationId, payload.name);
  if (existing) {
    throw new AppError(
      'Warehouse with this name already exists.',
      HTTP_STATUS.CONFLICT,
    );
  }

  const warehouse = await repository.create(organizationId, payload);
  return toWarehouseResponse(warehouse);
};

export const getWarehouses = async (
  organizationId: string,
  query: ListWarehousesQuery,
): Promise<ListWarehousesResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    status?: NonNullable<ListWarehousesQuery['status']>;
  } = {};

  if (query.search) filters.search = query.search;
  if (query.status !== undefined) filters.status = query.status;

  const [warehouses, total] = await repository.findMany(
    organizationId,
    filters,
    skip,
    limit,
  );

  return {
    warehouses: toWarehouseListResponse(warehouses),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getWarehouseById = async (
  organizationId: string,
  id: string,
) => {
  const warehouse = await repository.findById(organizationId, id);

  if (!warehouse) {
    throw new AppError('Warehouse not found.', HTTP_STATUS.NOT_FOUND);
  }

  return toWarehouseResponse(warehouse);
};

export const updateWarehouse = async (
  organizationId: string,
  id: string,
  payload: UpdateWarehouseInput,
) => {
  const warehouse = await repository.findById(organizationId, id);

  if (!warehouse) {
    throw new AppError('Warehouse not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError(
      'At least one field is required.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (payload.name !== undefined && payload.name !== warehouse.name) {
    const existing = await repository.findByName(organizationId, payload.name);
    if (existing) {
      throw new AppError(
        'Warehouse with this name already exists.',
        HTTP_STATUS.CONFLICT,
      );
    }
  }

  const updated = await repository.update(organizationId, id, payload);
  return toWarehouseResponse(updated);
};

export const deleteWarehouse = async (
  organizationId: string,
  id: string,
) => {
  const warehouse = await repository.findById(organizationId, id);

  if (!warehouse) {
    throw new AppError('Warehouse not found.', HTTP_STATUS.NOT_FOUND);
  }

  await repository.softDelete(id);

  return {
    message: 'Warehouse deactivated successfully.',
  };
};
