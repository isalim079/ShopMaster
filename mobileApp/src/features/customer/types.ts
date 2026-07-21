export type PartyStatus = 'ACTIVE' | 'INACTIVE';

export type Customer = {
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
  createdAt: string;
  updatedAt: string;
};

export type CustomerInput = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  creditLimit?: number;
  notes?: string;
  status?: PartyStatus;
};
