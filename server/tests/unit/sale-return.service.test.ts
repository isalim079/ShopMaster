import { DocumentStatus, PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { AppError } from '../../src/core/errors/app-error';
import * as saleReturnService from '../../src/modules/sale-return/sale-return.service';
import * as repository from '../../src/modules/sale-return/sale-return.repository';
import { prisma } from '../../src/core/database';
import { adjustStock } from '../../src/modules/inventory/inventory.service';
import { nextDocumentNumber } from '../../src/core/utils/document-number';

jest.mock('../../src/modules/sale-return/sale-return.repository');
jest.mock('../../src/modules/inventory/inventory.service', () => ({
  adjustStock: jest.fn(),
}));
jest.mock('../../src/core/utils/document-number', () => ({
  nextDocumentNumber: jest.fn(),
}));
jest.mock('../../src/core/database', () => ({
  prisma: {
    sale: { findFirst: jest.fn() },
    saleReturnItem: { findMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const mockedRepository = repository as jest.Mocked<typeof repository>;
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedAdjustStock = adjustStock as jest.Mock;
const mockedNextDocumentNumber = nextDocumentNumber as jest.Mock;

const buildSale = (
  overrides: Partial<{
    status: DocumentStatus;
    items: Array<{
      id: string;
      productId: string;
      quantity: Decimal;
      unitPrice: Decimal;
    }>;
  }> = {},
) => ({
  id: 'sale_1',
  organizationId: 'org_1',
  customerId: 'cust_1',
  warehouseId: 'wh_1',
  number: 'INV-0001',
  status: overrides.status ?? DocumentStatus.COMPLETED,
  paymentStatus: PaymentStatus.PAID,
  saleDate: new Date(),
  subtotal: new Decimal(100),
  taxAmount: new Decimal(0),
  discountAmount: new Decimal(0),
  total: new Decimal(100),
  paidAmount: new Decimal(100),
  notes: null,
  createdById: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  items:
    overrides.items ??
    [
      {
        id: 'si_1',
        productId: 'prod_1',
        quantity: new Decimal(2),
        unitPrice: new Decimal(50),
      },
    ],
});

describe('sale-return.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedNextDocumentNumber.mockResolvedValue('SR-0001');
    mockedAdjustStock.mockResolvedValue({
      stock: { productId: 'prod_1', warehouseId: 'wh_1', quantity: 5 },
      movement: {
        id: 'mov_1',
        type: 'SALE_RETURN',
        quantity: 1,
        balanceAfter: 5,
      },
    });
  });

  describe('createSaleReturn', () => {
    it('rejects missing sale', async () => {
      (mockedPrisma.sale.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(
        saleReturnService.createSaleReturn('org_1', {
          saleId: 'missing',
          items: [{ saleItemId: 'si_1', quantity: 1 }],
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('rejects non-completed sale', async () => {
      (mockedPrisma.sale.findFirst as jest.Mock).mockResolvedValue(
        buildSale({ status: DocumentStatus.DRAFT }),
      );
      await expect(
        saleReturnService.createSaleReturn('org_1', {
          saleId: 'sale_1',
          items: [{ saleItemId: 'si_1', quantity: 1 }],
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('rejects unknown sale item', async () => {
      (mockedPrisma.sale.findFirst as jest.Mock).mockResolvedValue(
        buildSale(),
      );
      (mockedPrisma.saleReturnItem.findMany as jest.Mock).mockResolvedValue(
        [],
      );

      await expect(
        saleReturnService.createSaleReturn('org_1', {
          saleId: 'sale_1',
          items: [{ saleItemId: 'si_missing', quantity: 1 }],
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('rejects quantity exceeding returnable', async () => {
      (mockedPrisma.sale.findFirst as jest.Mock).mockResolvedValue(buildSale());
      (mockedPrisma.saleReturnItem.findMany as jest.Mock).mockResolvedValue([
        { saleItemId: 'si_1', quantity: new Decimal(2) },
      ]);

      await expect(
        saleReturnService.createSaleReturn('org_1', {
          saleId: 'sale_1',
          items: [{ saleItemId: 'si_1', quantity: 1 }],
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('getSaleReturns', () => {
    it('returns paginated list', async () => {
      mockedRepository.findMany.mockResolvedValue([[] as never[], 0] as never);
      const result = await saleReturnService.getSaleReturns('org_1', {
        page: 1,
        limit: 10,
      });
      expect(result.saleReturns).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('getSaleReturnById', () => {
    it('throws when missing', async () => {
      mockedRepository.findById.mockResolvedValue(null);
      await expect(
        saleReturnService.getSaleReturnById('org_1', 'missing'),
      ).rejects.toBeInstanceOf(AppError);
    });
  });
});
