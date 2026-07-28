export type DiscountType = 'PERCENTAGE' | 'AMOUNT';

export type SaleLineInput = {
  quantity?: unknown;
  unitPrice?: unknown;
  taxRate?: unknown;
  discount?: unknown;
};

export type SaleTotalsBreakdown = {
  itemsGross: number;
  itemsDiscount: number;
  subtotal: number;
  taxAmount: number;
  orderDiscount: number;
  total: number;
};

function toNum(value: unknown): number {
  if (value === '' || value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Mirrors server sale math:
 * line net = qty * price - lineDiscount
 * tax on net; order discount subtracted from (subtotal + tax).
 * Percentage order discount applies to subtotal (pre-tax merchandise).
 */
export function computeSaleFormTotals(
  items: SaleLineInput[],
  discountType: DiscountType,
  discountValue: unknown,
): SaleTotalsBreakdown {
  let itemsGross = 0;
  let itemsDiscount = 0;
  let subtotal = 0;
  let taxAmount = 0;

  for (const item of items) {
    const qty = toNum(item.quantity);
    const price = toNum(item.unitPrice);
    const taxRate = toNum(item.taxRate);
    const lineDiscount = Math.max(0, toNum(item.discount));
    const gross = qty * price;
    const net = Math.max(0, gross - lineDiscount);
    const tax = (net * taxRate) / 100;

    itemsGross += gross;
    itemsDiscount += Math.min(lineDiscount, gross);
    subtotal += net;
    taxAmount += tax;
  }

  const rawDiscount = Math.max(0, toNum(discountValue));
  let orderDiscount = 0;
  if (discountType === 'PERCENTAGE') {
    const pct = Math.min(rawDiscount, 100);
    orderDiscount = (subtotal * pct) / 100;
  } else {
    orderDiscount = rawDiscount;
  }
  orderDiscount = Math.min(orderDiscount, subtotal + taxAmount);

  const total = Math.max(0, subtotal + taxAmount - orderDiscount);

  return {
    itemsGross,
    itemsDiscount,
    subtotal,
    taxAmount,
    orderDiscount,
    total,
  };
}

/** Absolute order discount to send as API `discountAmount`. */
export function toOrderDiscountAmount(
  discountType: DiscountType,
  discountValue: unknown,
  subtotal: number,
): number {
  const raw = Math.max(0, toNum(discountValue));
  if (discountType === 'PERCENTAGE') {
    return (subtotal * Math.min(raw, 100)) / 100;
  }
  return raw;
}
