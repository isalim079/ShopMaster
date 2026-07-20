import { OrganizationStatus } from '@prisma/client';

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  taxId: string | null;
  currency: string;
  timezone: string;
  logoUrl: string | null;
  status: OrganizationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListOrganizationsFilters {
  search?: string;
  status?: OrganizationStatus;
}

export interface ListOrganizationsResult {
  organizations: OrganizationResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
