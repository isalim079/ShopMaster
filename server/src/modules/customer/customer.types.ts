import { PartyStatus, Prisma } from '@prisma/client';

export interface CustomerResponse {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  taxId: string | null;
  creditLimit: number | null;
  notes: string | null;
  status: PartyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListCustomersFilters {
  search?: string;
  status?: PartyStatus;
}

export interface ListCustomersResult {
  customers: CustomerResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type DecimalValue = Prisma.Decimal | number | string | null;
