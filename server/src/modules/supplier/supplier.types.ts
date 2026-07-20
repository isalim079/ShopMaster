import { PartyStatus } from '@prisma/client';

export interface SupplierResponse {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  taxId: string | null;
  notes: string | null;
  status: PartyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListSuppliersFilters {
  search?: string;
  status?: PartyStatus;
}

export interface ListSuppliersResult {
  suppliers: SupplierResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
