import { Organization } from '@prisma/client';

import type { OrganizationResponse } from './organization.types';

export const toOrganizationResponse = (
  organization: Organization,
): OrganizationResponse => ({
  id: organization.id,
  name: organization.name,
  slug: organization.slug,
  email: organization.email,
  phone: organization.phone,
  address: organization.address,
  city: organization.city,
  country: organization.country,
  taxId: organization.taxId,
  currency: organization.currency,
  timezone: organization.timezone,
  logoUrl: organization.logoUrl,
  status: organization.status,
  createdAt: organization.createdAt,
  updatedAt: organization.updatedAt,
});

export const toOrganizationListResponse = (
  organizations: Organization[],
): OrganizationResponse[] => {
  return organizations.map(toOrganizationResponse);
};
