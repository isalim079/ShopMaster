import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { ROLE_SLUG } from '../../core/constants/roles';
import * as repository from './organization.repository';
import * as settingRepository from '../setting/setting.repository';
import {
  toOrganizationListResponse,
  toOrganizationResponse,
} from './organization.mapper';
import type {
  CreateOrganizationInput,
  ListOrganizationsQuery,
  UpdateMyOrganizationInput,
  UpdateOrganizationInput,
} from './organization.validation';
import type { ListOrganizationsResult } from './organization.types';
import { Prisma } from '@prisma/client';

export const createOrganization = async (payload: CreateOrganizationInput) => {
  try {
    const organization = await repository.create(payload);
    await settingRepository.ensureDefaultOrganizationSettings(organization.id);
    return toOrganizationResponse(organization);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new AppError(
        'Organization slug already exists.',
        HTTP_STATUS.CONFLICT,
      );
    }

    throw error;
  }
};

export const getOrganizations = async (
  query: ListOrganizationsQuery,
): Promise<ListOrganizationsResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    status?: NonNullable<ListOrganizationsQuery['status']>;
  } = {};

  if (query.search) {
    filters.search = query.search;
  }

  if (query.status !== undefined) {
    filters.status = query.status;
  }

  const [organizations, total] = await repository.findMany(
    filters,
    skip,
    limit,
  );

  return {
    organizations: toOrganizationListResponse(organizations),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getMyOrganization = async (organizationId: string) => {
  const organization = await repository.findById(organizationId);

  if (!organization) {
    throw new AppError('Organization not found.', HTTP_STATUS.NOT_FOUND);
  }

  return toOrganizationResponse(organization);
};

export const getOrganizationById = async (
  actor: { role: string; organizationId: string },
  id: string,
) => {
  if (
    actor.role !== ROLE_SLUG.SUPER_ADMIN &&
    actor.organizationId !== id
  ) {
    throw new AppError(
      'You do not have permission to view this organization.',
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const organization = await repository.findById(id);

  if (!organization) {
    throw new AppError('Organization not found.', HTTP_STATUS.NOT_FOUND);
  }

  return toOrganizationResponse(organization);
};

export const updateOrganization = async (
  actor: { role: string; organizationId: string },
  id: string,
  payload: UpdateOrganizationInput,
) => {
  if (
    actor.role !== ROLE_SLUG.SUPER_ADMIN &&
    actor.organizationId !== id
  ) {
    throw new AppError(
      'You do not have permission to update this organization.',
      HTTP_STATUS.FORBIDDEN,
    );
  }

  if (
    actor.role !== ROLE_SLUG.SUPER_ADMIN &&
    payload.status !== undefined
  ) {
    throw new AppError(
      'Only Super Admin can change organization status.',
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const organization = await repository.findById(id);

  if (!organization) {
    throw new AppError('Organization not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError(
      'At least one field is required.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const updated = await repository.update(id, payload);
  return toOrganizationResponse(updated);
};

export const updateMyOrganization = async (
  organizationId: string,
  payload: UpdateMyOrganizationInput,
) => {
  return updateOrganization(
    {
      role: ROLE_SLUG.ADMIN,
      organizationId,
    },
    organizationId,
    payload,
  );
};

export const deleteOrganization = async (id: string) => {
  const organization = await repository.findById(id);

  if (!organization) {
    throw new AppError('Organization not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (organization.id === 'org_default') {
    throw new AppError(
      'Default organization cannot be deleted.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  await repository.deactivate(id);

  return {
    message: 'Organization deactivated successfully.',
  };
};
