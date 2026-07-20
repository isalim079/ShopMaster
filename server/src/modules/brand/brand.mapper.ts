import { Brand } from '@prisma/client';

import type { BrandResponse } from './brand.types';

export const toBrandResponse = (brand: Brand): BrandResponse => ({
  id: brand.id,
  organizationId: brand.organizationId,
  name: brand.name,
  description: brand.description,
  logoUrl: brand.logoUrl,
  status: brand.status,
  createdAt: brand.createdAt,
  updatedAt: brand.updatedAt,
});

export const toBrandListResponse = (
  brands: Brand[],
): BrandResponse[] => {
  return brands.map(toBrandResponse);
};
