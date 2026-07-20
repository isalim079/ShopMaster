import { z } from 'zod';
import { OrganizationStatus } from '@prisma/client';

import { PAGINATION } from '../../core/constants/pagination';

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase letters, numbers, and hyphens.',
  );

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    slug: slugSchema.optional(),
    email: z.email().trim().toLowerCase().optional(),
    phone: z.string().trim().max(30).optional(),
    address: z.string().trim().max(255).optional(),
    city: z.string().trim().max(100).optional(),
    country: z.string().trim().max(100).optional(),
    taxId: z.string().trim().max(50).optional(),
    currency: z.string().trim().min(3).max(3).toUpperCase().optional(),
    timezone: z.string().trim().min(2).max(60).optional(),
    logoUrl: z.url().optional(),
  }),
});

export const updateOrganizationSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.email().trim().toLowerCase().optional().nullable(),
    phone: z.string().trim().max(30).optional().nullable(),
    address: z.string().trim().max(255).optional().nullable(),
    city: z.string().trim().max(100).optional().nullable(),
    country: z.string().trim().max(100).optional().nullable(),
    taxId: z.string().trim().max(50).optional().nullable(),
    currency: z.string().trim().min(3).max(3).toUpperCase().optional(),
    timezone: z.string().trim().min(2).max(60).optional(),
    logoUrl: z.url().optional().nullable(),
    status: z.nativeEnum(OrganizationStatus).optional(),
  }),
});

export const updateMyOrganizationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.email().trim().toLowerCase().optional().nullable(),
    phone: z.string().trim().max(30).optional().nullable(),
    address: z.string().trim().max(255).optional().nullable(),
    city: z.string().trim().max(100).optional().nullable(),
    country: z.string().trim().max(100).optional().nullable(),
    taxId: z.string().trim().max(50).optional().nullable(),
    currency: z.string().trim().min(3).max(3).toUpperCase().optional(),
    timezone: z.string().trim().min(2).max(60).optional(),
    logoUrl: z.url().optional().nullable(),
  }),
});

export const organizationIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1).max(64),
  }),
});

export const listOrganizationsSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .optional()
      .default(PAGINATION.DEFAULT_PAGE),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(PAGINATION.MAX_LIMIT)
      .optional()
      .default(PAGINATION.DEFAULT_LIMIT),
    search: z.string().trim().optional(),
    status: z.nativeEnum(OrganizationStatus).optional(),
  }),
});

export type CreateOrganizationInput = z.infer<
  typeof createOrganizationSchema
>['body'];

export type UpdateOrganizationInput = z.infer<
  typeof updateOrganizationSchema
>['body'];

export type UpdateMyOrganizationInput = z.infer<
  typeof updateMyOrganizationSchema
>['body'];

export type ListOrganizationsQuery = z.infer<
  typeof listOrganizationsSchema
>['query'];
