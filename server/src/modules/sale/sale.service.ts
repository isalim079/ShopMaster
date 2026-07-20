import {
  DocumentStatus,
  Prisma,
  StockMovementType,
} from '@prisma/client';

import * as repository from './sale.repository';
import {
  toSaleDetailResponse,
  toSaleListResponse,
} from './sale.mapper';
import type {
  CreateSaleInput,
  ListSalesQuery,
  SaleItemInput,
  UpdateSaleInput,
} from './sale.validation';
import type {
  ListSalesResult,
  SaleDetailResponse,
  SaleInvoiceResponse,
} from './sale.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { prisma } from '../../core/database';
import { adjustStock } from '../inventory/inventory.service';
import { nextDocumentNumber } from '../../core/utils/document-number';
import { SETTING_KEY } from '../../core/constants/settings';
import { env } from '../../core/config/env';
import { decimalToNumber } from '../product/product.mapper';

const SALE_REFERENCE_TYPE = 'sale';

interface ItemTotals {
  subtotal: number;
  taxAmount: number;
  itemLineTotals: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discount: number;
    lineTotal: number;
  }>;
}

const computeItemTotals = (items: SaleItemInput[]): ItemTotals => {
  let subtotal = 0;
  let taxAmount = 0;
  const itemLineTotals = items.map((item) => {
    const taxRate = item.taxRate ?? 0;
    const discount = item.discount ?? 0;
    const grossLine = item.quantity * item.unitPrice;
    const netLine = Math.max(0, grossLine - discount);
    const itemTax = (netLine * taxRate) / 100;
    const lineTotal = netLine + itemTax;

    subtotal += netLine;
    taxAmount += itemTax;

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate,
      discount,
      lineTotal,
    };
  });

  return { subtotal, taxAmount, itemLineTotals };
};

const validateOrgReferences = async (
  organizationId: string,
  warehouseId: string,
  customerId: string | null | undefined,
  productIds: string[],
) => {
  const [warehouse, customer, products] = await Promise.all([
    prisma.warehouse.findFirst({ where: { id: warehouseId, organizationId } }),
    customerId
      ? prisma.customer.findFirst({
          where: { id: customerId, organizationId },
        })
      : Promise.resolve(null),
    productIds.length > 0
      ? prisma.product.findMany({
          where: { id: { in: productIds }, organizationId },
          select: { id: true },
        })
      : Promise.resolve([] as { id: string }[]),
  ]);

  if (!warehouse) {
    throw new AppError(
      'Warehouse not found in this organization.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (customerId && !customer) {
    throw new AppError(
      'Customer not found in this organization.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const foundIds = new Set(products.map((p) => p.id));
  const missing = productIds.find((id) => !foundIds.has(id));
  if (missing) {
    throw new AppError(
      `Product ${missing} not found in this organization.`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

const readAllowNegativeStock = async (
  organizationId: string,
): Promise<boolean> => {
  const setting = await prisma.organizationSetting.findUnique({
    where: {
      organizationId_key: {
        organizationId,
        key: SETTING_KEY.SALE_ALLOW_NEGATIVE_STOCK,
      },
    },
  });

  const raw =
    setting?.value ?? env.SETTING_DEFAULT_ALLOW_NEGATIVE_STOCK ?? 'false';

  return raw.toLowerCase() === 'true';
};

interface SaleTotals {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

const computeSaleTotals = (
  itemsTotals: ItemTotals,
  discountAmountInput: number | undefined,
): SaleTotals => {
  const discountAmount = discountAmountInput ?? 0;
  const total = Math.max(
    0,
    itemsTotals.subtotal + itemsTotals.taxAmount - discountAmount,
  );
  return {
    subtotal: itemsTotals.subtotal,
    taxAmount: itemsTotals.taxAmount,
    discountAmount,
    total,
  };
};

const deductStockForItems = async (
  organizationId: string,
  warehouseId: string,
  saleId: string,
  saleNumber: string,
  items: ItemTotals['itemLineTotals'],
  tx: Prisma.TransactionClient,
  allowNegative: boolean,
  createdById?: string,
) => {
  for (const item of items) {
    await adjustStock(organizationId, {
      productId: item.productId,
      warehouseId,
      quantity: -item.quantity,
      type: StockMovementType.SALE,
      unitCost: item.unitPrice,
      referenceType: SALE_REFERENCE_TYPE,
      referenceId: saleId,
      ...(createdById !== undefined ? { createdById } : {}),
      note: `Sale ${saleNumber}`,
      tx,
      allowNegative,
    });
  }
};

export const createSale = async (
  organizationId: string,
  payload: CreateSaleInput,
  createdById?: string,
): Promise<SaleDetailResponse> => {
  const productIds = payload.items.map((item) => item.productId);
  await validateOrgReferences(
    organizationId,
    payload.warehouseId,
    payload.customerId,
    productIds,
  );

  const itemsTotals = computeItemTotals(payload.items);
  const totals = computeSaleTotals(itemsTotals, payload.discountAmount);
  const status = payload.status ?? DocumentStatus.COMPLETED;
  const allowNegative =
    status === DocumentStatus.COMPLETED
      ? await readAllowNegativeStock(organizationId)
      : false;

  const created = await prisma.$transaction(async (tx) => {
    const number = await nextDocumentNumber({
      organizationId,
      prefixKey: SETTING_KEY.INVOICE_PREFIX,
      nextKey: SETTING_KEY.INVOICE_NEXT_NUMBER,
      defaultPrefix: env.SETTING_DEFAULT_INVOICE_PREFIX,
      defaultNext: env.SETTING_DEFAULT_INVOICE_NEXT_NUMBER,
      tx,
    });

    const data: Prisma.SaleUncheckedCreateInput = {
      organizationId,
      warehouseId: payload.warehouseId,
      number,
      status,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      discountAmount: totals.discountAmount,
      total: totals.total,
      notes: payload.notes ?? null,
      items: {
        create: itemsTotals.itemLineTotals.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          discount: item.discount,
          lineTotal: item.lineTotal,
        })),
      },
    };

    if (payload.customerId) data.customerId = payload.customerId;
    if (payload.saleDate) data.saleDate = payload.saleDate;
    if (createdById) data.createdById = createdById;

    const sale = await tx.sale.create({
      data,
      include: {
        customer: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (status === DocumentStatus.COMPLETED) {
      await deductStockForItems(
        organizationId,
        payload.warehouseId,
        sale.id,
        sale.number,
        itemsTotals.itemLineTotals,
        tx,
        allowNegative,
        createdById,
      );
    }

    return sale;
  });

  return toSaleDetailResponse(created);
};

export const getSales = async (
  organizationId: string,
  query: ListSalesQuery,
): Promise<ListSalesResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    status?: NonNullable<ListSalesQuery['status']>;
    paymentStatus?: NonNullable<ListSalesQuery['paymentStatus']>;
    customerId?: string;
    warehouseId?: string;
  } = {};

  if (query.search) filters.search = query.search;
  if (query.status !== undefined) filters.status = query.status;
  if (query.paymentStatus !== undefined)
    filters.paymentStatus = query.paymentStatus;
  if (query.customerId) filters.customerId = query.customerId;
  if (query.warehouseId) filters.warehouseId = query.warehouseId;

  const [sales, total] = await repository.findMany(
    organizationId,
    filters,
    skip,
    limit,
  );

  return {
    sales: toSaleListResponse(sales),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getSaleById = async (
  organizationId: string,
  id: string,
): Promise<SaleDetailResponse> => {
  const sale = await repository.findById(organizationId, id);
  if (!sale) {
    throw new AppError('Sale not found.', HTTP_STATUS.NOT_FOUND);
  }
  return toSaleDetailResponse(sale);
};

export const updateSale = async (
  organizationId: string,
  id: string,
  payload: UpdateSaleInput,
): Promise<SaleDetailResponse> => {
  const sale = await repository.findByIdBasic(organizationId, id);
  if (!sale) {
    throw new AppError('Sale not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (sale.status !== DocumentStatus.DRAFT) {
    throw new AppError(
      'Only draft sales can be updated.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError(
      'At least one field is required.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const warehouseId = payload.warehouseId ?? sale.warehouseId;
  const customerIdForValidation =
    payload.customerId === undefined ? sale.customerId : payload.customerId;

  if (payload.items) {
    const productIds = payload.items.map((item) => item.productId);
    await validateOrgReferences(
      organizationId,
      warehouseId,
      customerIdForValidation,
      productIds,
    );
  } else if (
    payload.warehouseId ||
    payload.customerId !== undefined
  ) {
    await validateOrgReferences(
      organizationId,
      warehouseId,
      customerIdForValidation,
      [],
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const data: Prisma.SaleUpdateInput = {};

    if (payload.warehouseId)
      data.warehouse = { connect: { id: payload.warehouseId } };
    if (payload.customerId === null) {
      data.customer = { disconnect: true };
    } else if (payload.customerId) {
      data.customer = { connect: { id: payload.customerId } };
    }
    if (payload.saleDate) data.saleDate = payload.saleDate;
    if (payload.notes !== undefined) data.notes = payload.notes;

    if (payload.items) {
      const itemsTotals = computeItemTotals(payload.items);
      const discountAmount =
        payload.discountAmount ?? decimalToNumber(sale.discountAmount);
      const totals = computeSaleTotals(itemsTotals, discountAmount);

      data.subtotal = totals.subtotal;
      data.taxAmount = totals.taxAmount;
      data.discountAmount = totals.discountAmount;
      data.total = totals.total;

      await tx.saleItem.deleteMany({ where: { saleId: id } });
      await tx.saleItem.createMany({
        data: itemsTotals.itemLineTotals.map((item) => ({
          saleId: id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          discount: item.discount,
          lineTotal: item.lineTotal,
        })),
      });
    } else if (payload.discountAmount !== undefined) {
      const subtotal = decimalToNumber(sale.subtotal);
      const taxAmount = decimalToNumber(sale.taxAmount);
      data.discountAmount = payload.discountAmount;
      data.total = Math.max(0, subtotal + taxAmount - payload.discountAmount);
    }

    return tx.sale.update({
      where: { id },
      data,
      include: {
        customer: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });
  });

  return toSaleDetailResponse(updated);
};

export const cancelSale = async (
  organizationId: string,
  id: string,
): Promise<{ message: string }> => {
  const sale = await repository.findByIdBasic(organizationId, id);
  if (!sale) {
    throw new AppError('Sale not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (sale.status !== DocumentStatus.DRAFT) {
    throw new AppError(
      'Only draft sales can be cancelled.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  await prisma.sale.update({
    where: { id },
    data: { status: DocumentStatus.CANCELLED },
  });

  return { message: 'Sale cancelled successfully.' };
};

export const completeSale = async (
  organizationId: string,
  id: string,
  createdById?: string,
): Promise<SaleDetailResponse> => {
  const sale = await repository.findByIdBasic(organizationId, id);
  if (!sale) {
    throw new AppError('Sale not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (sale.status !== DocumentStatus.DRAFT) {
    throw new AppError(
      'Only draft sales can be completed.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (sale.items.length === 0) {
    throw new AppError(
      'Cannot complete a sale with no items.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const allowNegative = await readAllowNegativeStock(organizationId);

  const updated = await prisma.$transaction(async (tx) => {
    const itemsForStock = sale.items.map((item) => ({
      productId: item.productId,
      quantity: decimalToNumber(item.quantity),
      unitPrice: decimalToNumber(item.unitPrice),
      taxRate: decimalToNumber(item.taxRate),
      discount: decimalToNumber(item.discount),
      lineTotal: decimalToNumber(item.lineTotal),
    }));

    await deductStockForItems(
      organizationId,
      sale.warehouseId,
      sale.id,
      sale.number,
      itemsForStock,
      tx,
      allowNegative,
      createdById,
    );

    return tx.sale.update({
      where: { id },
      data: { status: DocumentStatus.COMPLETED },
      include: {
        customer: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });
  });

  return toSaleDetailResponse(updated);
};

export const getSaleInvoice = async (
  organizationId: string,
  id: string,
): Promise<SaleInvoiceResponse> => {
  const sale = await repository.findInvoiceById(organizationId, id);
  if (!sale) {
    throw new AppError('Sale not found.', HTTP_STATUS.NOT_FOUND);
  }

  const subtotal = decimalToNumber(sale.subtotal);
  const taxAmount = decimalToNumber(sale.taxAmount);
  const discountAmount = decimalToNumber(sale.discountAmount);
  const total = decimalToNumber(sale.total);
  const paidAmount = decimalToNumber(sale.paidAmount);

  const invoice: SaleInvoiceResponse = {
    id: sale.id,
    organizationId: sale.organizationId,
    number: sale.number,
    status: sale.status,
    paymentStatus: sale.paymentStatus,
    saleDate: sale.saleDate,
    customer: sale.customer
      ? {
          id: sale.customer.id,
          name: sale.customer.name,
          email: sale.customer.email,
          phone: sale.customer.phone,
          address: sale.customer.address,
        }
      : null,
    warehouse: {
      id: sale.warehouse.id,
      name: sale.warehouse.name,
    },
    lines: sale.items.map((item) => ({
      productId: item.productId,
      productName: item.product?.name ?? '',
      quantity: decimalToNumber(item.quantity),
      unitPrice: decimalToNumber(item.unitPrice),
      taxRate: decimalToNumber(item.taxRate),
      discount: decimalToNumber(item.discount),
      lineTotal: decimalToNumber(item.lineTotal),
    })),
    subtotal,
    taxAmount,
    discountAmount,
    total,
    paidAmount,
    balanceDue: Math.max(0, total - paidAmount),
    notes: sale.notes,
    createdAt: sale.createdAt,
  };

  if (sale.organization?.name) invoice.organizationName = sale.organization.name;

  return invoice;
};
