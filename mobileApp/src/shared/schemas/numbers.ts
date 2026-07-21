import { z } from 'zod';

/** TextInput-friendly number: accepts string | number, outputs number. */
export const zNum = z
  .union([z.string(), z.number()])
  .transform((value, ctx) => {
    if (value === '' || value === null || value === undefined) {
      ctx.addIssue({ code: 'custom', message: 'Required' });
      return z.NEVER;
    }
    const n = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(n)) {
      ctx.addIssue({ code: 'custom', message: 'Invalid number' });
      return z.NEVER;
    }
    return n;
  });

export const zNumMin = (min: number, message?: string) =>
  zNum.pipe(z.number().min(min, message));

export const zNumPositive = (message = 'Must be greater than 0') =>
  zNum.pipe(z.number().positive(message));

/** Optional number; empty string → undefined */
export const zNumOptional = z
  .union([z.string(), z.number(), z.literal('')])
  .optional()
  .transform((value) => {
    if (value === '' || value === undefined || value === null) return undefined;
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isNaN(n) ? undefined : n;
  });
