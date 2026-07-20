import { z } from 'zod';

export const seriesQuerySchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(1).max(365).optional().default(30),
  }),
});

export const topProductsQuerySchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(1).max(365).optional().default(30),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  }),
});

export const topCustomersQuerySchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(1).max(365).optional().default(30),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  }),
});

export type SeriesQuery = z.infer<typeof seriesQuerySchema>['query'];
export type TopProductsQuery = z.infer<typeof topProductsQuerySchema>['query'];
export type TopCustomersQuery = z.infer<
  typeof topCustomersQuerySchema
>['query'];
