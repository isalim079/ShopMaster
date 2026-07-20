import * as repository from './customer.repository';
import {
  toCustomerListResponse,
  toCustomerResponse,
} from './customer.mapper';
import type {
  CreateCustomerInput,
  ListCustomersQuery,
  UpdateCustomerInput,
} from './customer.validation';
import type { ListCustomersResult } from './customer.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';

export const createCustomer = async (
  organizationId: string,
  payload: CreateCustomerInput,
) => {
  const customer = await repository.create(organizationId, payload);
  return toCustomerResponse(customer);
};

export const getCustomers = async (
  organizationId: string,
  query: ListCustomersQuery,
): Promise<ListCustomersResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    status?: NonNullable<ListCustomersQuery['status']>;
  } = {};

  if (query.search) filters.search = query.search;
  if (query.status !== undefined) filters.status = query.status;

  const [customers, total] = await repository.findMany(
    organizationId,
    filters,
    skip,
    limit,
  );

  return {
    customers: toCustomerListResponse(customers),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getCustomerById = async (
  organizationId: string,
  id: string,
) => {
  const customer = await repository.findById(organizationId, id);

  if (!customer) {
    throw new AppError('Customer not found.', HTTP_STATUS.NOT_FOUND);
  }

  return toCustomerResponse(customer);
};

export const updateCustomer = async (
  organizationId: string,
  id: string,
  payload: UpdateCustomerInput,
) => {
  const customer = await repository.findById(organizationId, id);

  if (!customer) {
    throw new AppError('Customer not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError(
      'At least one field is required.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const updated = await repository.update(id, payload);
  return toCustomerResponse(updated);
};

export const deleteCustomer = async (
  organizationId: string,
  id: string,
) => {
  const customer = await repository.findById(organizationId, id);

  if (!customer) {
    throw new AppError('Customer not found.', HTTP_STATUS.NOT_FOUND);
  }

  await repository.softDelete(id);

  return {
    message: 'Customer deactivated successfully.',
  };
};
