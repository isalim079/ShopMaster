export type CatalogStatus = 'ACTIVE' | 'INACTIVE';

export type DocumentStatus =
  | 'DRAFT'
  | 'ORDERED'
  | 'PARTIAL'
  | 'RECEIVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export type PaymentDirection = 'IN' | 'OUT';

export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'BANK'
  | 'MOBILE_BANKING'
  | 'CHEQUE'
  | 'OTHER';

export type StockMovementType =
  | 'ADJUSTMENT'
  | 'PURCHASE'
  | 'PURCHASE_RETURN'
  | 'SALE'
  | 'SALE_RETURN'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export const CATALOG_STATUSES = ['ACTIVE', 'INACTIVE'] as const;

export const PAYMENT_METHODS = [
  'CASH',
  'CARD',
  'BANK',
  'MOBILE_BANKING',
  'CHEQUE',
  'OTHER',
] as const;

export const PAYMENT_DIRECTIONS = ['IN', 'OUT'] as const;