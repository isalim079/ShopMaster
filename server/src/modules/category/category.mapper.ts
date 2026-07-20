import { Category } from '@prisma/client';

import type { CategoryResponse } from './category.types';

export const toCategoryResponse = (category: Category): CategoryResponse => ({
  id: category.id,
  organizationId: category.organizationId,
  name: category.name,
  description: category.description,
  parentId: category.parentId,
  status: category.status,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

export const toCategoryListResponse = (
  categories: Category[],
): CategoryResponse[] => {
  return categories.map(toCategoryResponse);
};
