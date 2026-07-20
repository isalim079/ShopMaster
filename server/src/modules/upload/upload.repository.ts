import { Prisma } from '@prisma/client';

import { prisma } from '../../core/database';

export const findMany = (
  organizationId: string,
  filters: { search?: string },
  skip: number,
  take: number,
) => {
  const where: Prisma.UploadWhereInput = { organizationId };

  if (filters.search) {
    where.OR = [
      { originalName: { contains: filters.search, mode: 'insensitive' } },
      { filename: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.$transaction([
    prisma.upload.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.upload.count({ where }),
  ]);
};

export const findById = (organizationId: string, id: string) => {
  return prisma.upload.findFirst({
    where: { id, organizationId },
  });
};

export const create = (data: {
  organizationId: string;
  userId?: string | null;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url?: string | null;
}) => {
  return prisma.upload.create({ data });
};

export const remove = (id: string) => {
  return prisma.upload.delete({ where: { id } });
};
