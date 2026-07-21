export type PartyStatus = 'ACTIVE' | 'INACTIVE';

export type Supplier = {
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
  createdAt: string;
  updatedAt: string;
};

export type SupplierInput = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  notes?: string;
  status?: PartyStatus;
};
