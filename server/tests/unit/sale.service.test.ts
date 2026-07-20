import { DocumentStatus, PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { AppError } from '../../src/core/errors/app-error';
import * as saleService from '../../src/modules/sale/sale.service';
import * as repository from '../../src/modules/sale/sale.repository';
import { prisma } from '../../src/core/database';
import { adjustStock } from '../../src/modules/inventory/inventory.service';
import { nextDocumentNumber } from '../../src/core/utils/document-number';

jest.mock('../../src/modules/sale/sale.repository');
jest.mock('../../src/modules/inventory/inventory.service', () => ({
  adjustStock: jest.fn(),
}));
jest.mock('../../src/core/utils/document-number', () => ({
  nextDocumentNumber: jest.fn(),
}));
jest.mock('../../src/core/database', () => ({
  prisma: {
    warehouse: { findFirst: jest.fn() },
    customer: { findFirst: jest.fn() },
    product: { findMany: jest.fn() },
    organizationSetting: { findUnique: jest.fn() },
    sale: { update: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const mockedRepository = repository as jest.Mocked<typeof repository>;
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedAdjustStock = adjustStock as jest.Mock;
const mockedNextDocumentNumber = nextDocumentNumber as jest.Mock;

const buildSaleBasic = (
  overrides: Partial<{
    status: DocumentStatus;
    items: Array<{
      id: string;
      productId: string;
      quantity: Decimal;
      unitPrice: Decimal;
      taxRate: Decimal;
      discount: Decimal;
      lineTotal: Decimal;
    }>;
  }> = {},
) => ({
  id: 'sale_1',
  organizationId: 'org_1',
  customerId: null,
  warehouseId: 'wh_1',
  number: 'INV-0001',
  status: overrides.status ?? DocumentStatus.DRAFT,
  paymentStatus: PaymentStatus.UNPAID,
  saleDate: new Date(),
  subtotal: new Decimal(100),
  taxAmount: new Decimal(0),
  discountAmount: new Decimal(0),
  total: new Decimal(100),
  paidAmount: new Decimal(0),
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
        taxRate: new Decimal(0),
        discount: new Decimal(0),
        lineTotal: new Decimal(100),
      },
    ],
});

describe('sale.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedNextDocumentNumber.mockResolvedValue('INV-0001');
    mockedAdjustStock.mockResolvedValue({
      stock: { productId: 'prod_1', warehouseId: 'wh_1', quantity: 3 },
      movement: {
        id: 'mov_1',
        type: 'SALE',
        quantity: -2,
        balanceAfter: 3,
      },
    });
    (mockedPrisma.organizationSetting.findUnique as jest.Mock).mockResolvedValue(
      null,
    );
  });

  describe('createSale', () => {
    it('rejects invalid warehouse', async () => {
      (mockedPrisma.warehouse.findFirst as jest.Mock).mockResolvedValue(null);
      (mockedPrisma.product.findMany as jest.Mock).mockResolvedValue([
        { id: 'prod_1' },
      ]);

      await expect(
        saleService.createSale('org_1', {
          warehouseId: 'bad',
          items: [{ productId: 'prod_1', quantity: 1, unitPrice: 100 }],
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('rejects invalid customer when provided', async () => {
      (mockedPrisma.warehouse.findFirst as jest.Mock).mockResolvedValue({
        id: 'wh_1',
      });
      (mockedPrisma.customer.findFirst as jest.Mock).mockResolvedValue(null);
      (mockedPrisma.product.findMany as jest.Mock).mockResolvedValue([
        { id: 'prod_1' },
      ]);

      await expect(
        saleService.createSale('org_1', {
          warehouseId: 'wh_1',
          customerId: 'cust_missing',
          items: [{ productId: 'prod_1', quantity: 1, unitPrice: 100 }],
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('rejects unknown product', async () => {
      (mockedPrisma.warehouse.findFirst as jest.Mock).mockResolvedValue({
        id: 'wh_1',
      });
      (mockedPrisma.product.findMany as jest.Mock).mockResolvedValue([]);

      await expect(
        saleService.createSale('org_1', {
          warehouseId: 'wh_1',
          items: [{ productId: 'prod_missing', quantity: 1, unitPrice: 100 }],
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('getSales', () => {
    it('returns paginated list', async () => {
      mockedRepository.findMany.mockResolvedValue([[] as never[], 0] as never);
      const result = await saleService.getSales('org_1', {
        page: 1,
        limit: 10,
      });
      expect(result.sales).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('getSaleById', () => {
    it('throws when missing', async () => {
      mockedRepository.findById.mockResolvedValue(null);
      await expect(
        saleService.getSaleById('org_1', 'missing'),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('updateSale', () => {
    it('rejects when sale not found', async () => {
      mockedRepository.findByIdBasic.mockResolvedValue(null);
      await expect(
        saleService.updateSale('org_1', 'missing', { notes: 'x' }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('rejects updating non-draft sale', async () => {
      mockedRepository.findByIdBasic.mockResolvedValue(
        buildSaleBasic({ status: DocumentStatus.COMPLETED }) as never,
      );
      await expect(
        saleService.updateSale('org_1', 'sale_1', { notes: 'x' }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('rejects empty payload', async () => {
      mockedRepository.findByIdBasic.mockResolvedValue(
        buildSaleBasic() as never,
      );
      await expect(
        saleService.updateSale('org_1', 'sale_1', {}),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('cancelSale', () => {
    it('rejects non-draft cancellation', async () => {
      mockedRepository.findByIdBasic.mockResolvedValue(
        buildSaleBasic({ status: DocumentStatus.COMPLETED }) as never,
      );
      await expect(
        saleService.cancelSale('org_1', 'sale_1'),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('cancels draft sale', async () => {
      mockedRepository.findByIdBasic.mockResolvedValue(
        buildSaleBasic() as never,
      );
      (mockedPrisma.sale.update as jest.Mock).mockResolvedValue({});
      const result = await saleService.cancelSale('org_1', 'sale_1');
      expect(result.message).toMatch(/cancelled/i);
    });
  });

  describe('completeSale', () => {
    it('rejects when sale not draft', async () => {
      mockedRepository.findByIdBasic.mockResolvedValue(
        buildSaleBasic({ status: DocumentStatus.COMPLETED }) as never,
      );
      await expect(
        saleService.completeSale('org_1', 'sale_1'),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('rejects when no items', async () => {
      mockedRepository.findByIdBasic.mockResolvedValue(
        buildSaleBasic({ items: [] }) as never,
      );
      await expect(
        saleService.completeSale('org_1', 'sale_1'),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('getSaleInvoice', () => {
    it('throws when sale missing', async () => {
      mockedRepository.findInvoiceById.mockResolvedValue(null);
      await expect(
        saleService.getSaleInvoice('org_1', 'missing'),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('returns invoice payload', async () => {
      mockedRepository.findInvoiceById.mockResolvedValue({
        ...buildSaleBasic({ status: DocumentStatus.COMPLETED }),
        customer: null,
        warehouse: { id: 'wh_1', name: 'Main' },
        organization: { name: 'ShopMaster' },
        items: [
          {
            id: 'si_1',
            productId: 'prod_1',
            quantity: new Decimal(2),
            unitPrice: new Decimal(50),
            taxRate: new Decimal(0),
            discount: new Decimal(0),
            lineTotal: new Decimal(100),
            product: { name: 'Widget' },
          },
        ],
      } as never);

      const invoice = await saleService.getSaleInvoice('org_1', 'sale_1');
      expect(invoice.number).toBe('INV-0001');
      expect(invoice.lines).toHaveLength(1);
      expect(invoice.lines[0]!.productName).toBe('Widget');
      expect(invoice.total).toBe(100);
      expect(invoice.balanceDue).toBe(100);
      expect(invoice.organizationName).toBe('ShopMaster');
    });
  });
});
