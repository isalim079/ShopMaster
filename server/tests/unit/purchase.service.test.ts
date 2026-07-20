import { DocumentStatus, PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { AppError } from '../../src/core/errors/app-error';
import * as purchaseService from '../../src/modules/purchase/purchase.service';
import * as repository from '../../src/modules/purchase/purchase.repository';
import { prisma } from '../../src/core/database';
import { adjustStock } from '../../src/modules/inventory/inventory.service';
import { nextDocumentNumber } from '../../src/core/utils/document-number';

jest.mock('../../src/modules/purchase/purchase.repository');
jest.mock('../../src/modules/inventory/inventory.service', () => ({
  adjustStock: jest.fn(),
}));
jest.mock('../../src/core/utils/document-number', () => ({
  nextDocumentNumber: jest.fn(),
}));
jest.mock('../../src/core/database', () => ({
  prisma: {
    supplier: { findFirst: jest.fn() },
    warehouse: { findFirst: jest.fn() },
    product: { findMany: jest.fn() },
    purchase: { update: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const mockedRepository = repository as jest.Mocked<typeof repository>;
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedAdjustStock = adjustStock as jest.Mock;
const mockedNextDocumentNumber = nextDocumentNumber as jest.Mock;

const buildPurchase = (
  overrides: Partial<{
    status: DocumentStatus;
    items: Array<{
      id: string;
      productId: string;
      quantity: Decimal;
      receivedQty: Decimal;
      unitCost: Decimal;
    }>;
  }> = {},
) => ({
  id: 'po_1',
  organizationId: 'org_1',
  supplierId: 'sup_1',
  warehouseId: 'wh_1',
  number: 'PO-0001',
  status: overrides.status ?? DocumentStatus.DRAFT,
  paymentStatus: PaymentStatus.UNPAID,
  orderDate: new Date(),
  expectedDate: null,
  subtotal: new Decimal(200),
  taxAmount: new Decimal(0),
  discountAmount: new Decimal(0),
  total: new Decimal(200),
  paidAmount: new Decimal(0),
  notes: null,
  createdById: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  items:
    overrides.items ??
    [
      {
        id: 'poi_1',
        productId: 'prod_1',
        quantity: new Decimal(10),
        receivedQty: new Decimal(0),
        unitCost: new Decimal(20),
      },
    ],
});

describe('purchase.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedNextDocumentNumber.mockResolvedValue('PO-0001');
    mockedAdjustStock.mockResolvedValue({
      stock: { productId: 'prod_1', warehouseId: 'wh_1', quantity: 5 },
      movement: {
        id: 'mov_1',
        type: 'PURCHASE',
        quantity: 5,
        balanceAfter: 5,
      },
    });
  });

  describe('createPurchase', () => {
    it('rejects invalid supplier', async () => {
      (mockedPrisma.supplier.findFirst as jest.Mock).mockResolvedValue(null);
      (mockedPrisma.warehouse.findFirst as jest.Mock).mockResolvedValue({
        id: 'wh_1',
      });
      (mockedPrisma.product.findMany as jest.Mock).mockResolvedValue([
        { id: 'prod_1' },
      ]);

      await expect(
        purchaseService.createPurchase('org_1', {
          supplierId: 'bad',
          warehouseId: 'wh_1',
          items: [{ productId: 'prod_1', quantity: 1, unitCost: 10 }],
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('rejects unknown product', async () => {
      (mockedPrisma.supplier.findFirst as jest.Mock).mockResolvedValue({
        id: 'sup_1',
      });
      (mockedPrisma.warehouse.findFirst as jest.Mock).mockResolvedValue({
        id: 'wh_1',
      });
      (mockedPrisma.product.findMany as jest.Mock).mockResolvedValue([]);

      await expect(
        purchaseService.createPurchase('org_1', {
          supplierId: 'sup_1',
          warehouseId: 'wh_1',
          items: [{ productId: 'prod_missing', quantity: 1, unitCost: 10 }],
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('getPurchases', () => {
    it('returns paginated purchases', async () => {
      const purchase = buildPurchase();
      mockedRepository.findMany.mockResolvedValue([[purchase], 1] as never);

      const result = await purchaseService.getPurchases('org_1', {
        page: 1,
        limit: 10,
      });

      expect(result.purchases).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getPurchaseById', () => {
    it('throws when missing', async () => {
      mockedRepository.findById.mockResolvedValue(null);
      await expect(
        purchaseService.getPurchaseById('org_1', 'missing'),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('cancelPurchase', () => {
    it('rejects when items already received', async () => {
      mockedRepository.findByIdBasic.mockResolvedValue(
        buildPurchase({
          items: [
            {
              id: 'poi_1',
              productId: 'prod_1',
              quantity: new Decimal(5),
              receivedQty: new Decimal(2),
              unitCost: new Decimal(10),
            },
          ],
        }) as never,
      );

      await expect(
        purchaseService.cancelPurchase('org_1', 'po_1'),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('cancels draft purchase', async () => {
      mockedRepository.findByIdBasic.mockResolvedValue(
        buildPurchase() as never,
      );
      (mockedPrisma.purchase.update as jest.Mock).mockResolvedValue({});

      const result = await purchaseService.cancelPurchase('org_1', 'po_1');
      expect(result.message).toMatch(/cancelled/i);
    });
  });

  describe('receivePurchase', () => {
    it('rejects exceeding outstanding qty', async () => {
      const purchase = buildPurchase();
      mockedRepository.findByIdBasic.mockResolvedValue(purchase as never);

      await expect(
        purchaseService.receivePurchase('org_1', 'po_1', {
          items: [{ purchaseItemId: 'poi_1', quantity: 99 }],
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('rejects unknown item id', async () => {
      const purchase = buildPurchase();
      mockedRepository.findByIdBasic.mockResolvedValue(purchase as never);

      await expect(
        purchaseService.receivePurchase('org_1', 'po_1', {
          items: [{ purchaseItemId: 'poi_missing', quantity: 1 }],
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });
});
