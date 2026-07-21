export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: {
    id: string;
    name: string;
    slug: string;
  };
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type OrganizationProfile = {
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
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateOrganizationInput = {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  taxId?: string | null;
  currency?: string;
  timezone?: string;
  logoUrl?: string | null;
};
