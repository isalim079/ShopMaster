import { OrganizationStatus, Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import { env } from '../../core/config/env';
import { slugify } from '../../core/utils/slugify';
import type { ListOrganizationsFilters } from './organization.types';
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from './organization.validation';

export const findById = (id: string) => {
  return prisma.organization.findUnique({
    where: { id },
  });
};

export const findBySlug = (slug: string) => {
  return prisma.organization.findUnique({
    where: { slug },
  });
};

export const findMany = (
  filters: ListOrganizationsFilters,
  skip: number,
  take: number,
) => {
  const where = buildWhere(filters);

  return prisma.$transaction([
    prisma.organization.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.organization.count({ where }),
  ]);
};

export const create = async (payload: CreateOrganizationInput) => {
  const baseSlug = payload.slug ?? slugify(payload.name);
  const slug = await ensureUniqueSlug(baseSlug);

  const data: Prisma.OrganizationCreateInput = {
    name: payload.name,
    slug,
    currency: payload.currency ?? env.ORGANIZATION_DEFAULT_CURRENCY,
    timezone: payload.timezone ?? env.ORGANIZATION_DEFAULT_TIMEZONE,
  };

  if (payload.email !== undefined) data.email = payload.email;
  if (payload.phone !== undefined) data.phone = payload.phone;
  if (payload.address !== undefined) data.address = payload.address;
  if (payload.city !== undefined) data.city = payload.city;
  if (payload.country !== undefined) data.country = payload.country;
  if (payload.taxId !== undefined) data.taxId = payload.taxId;
  if (payload.logoUrl !== undefined) data.logoUrl = payload.logoUrl;

  return prisma.organization.create({ data });
};

export const update = (id: string, payload: UpdateOrganizationInput) => {
  const data: Prisma.OrganizationUpdateInput = {};

  if (payload.name !== undefined) data.name = payload.name;
  if (payload.email !== undefined) data.email = payload.email;
  if (payload.phone !== undefined) data.phone = payload.phone;
  if (payload.address !== undefined) data.address = payload.address;
  if (payload.city !== undefined) data.city = payload.city;
  if (payload.country !== undefined) data.country = payload.country;
  if (payload.taxId !== undefined) data.taxId = payload.taxId;
  if (payload.currency !== undefined) data.currency = payload.currency;
  if (payload.timezone !== undefined) data.timezone = payload.timezone;
  if (payload.logoUrl !== undefined) data.logoUrl = payload.logoUrl;
  if (payload.status !== undefined) data.status = payload.status;

  return prisma.organization.update({
    where: { id },
    data,
  });
};

export const deactivate = (id: string) => {
  return prisma.organization.update({
    where: { id },
    data: {
      status: OrganizationStatus.INACTIVE,
    },
  });
};

export const countUsers = (organizationId: string) => {
  return prisma.user.count({
    where: { organizationId },
  });
};

export const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
  let slug = baseSlug;
  let suffix = 1;

  while (await findBySlug(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

const buildWhere = (
  filters: ListOrganizationsFilters,
): Prisma.OrganizationWhereInput => {
  const where: Prisma.OrganizationWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      {
        name: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        slug: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        email: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        phone: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
    ];
  }

  return where;
};
