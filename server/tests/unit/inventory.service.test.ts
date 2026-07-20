import { StockMovementType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { AppError } from '../../src/core/errors/app-error';
import * as inventoryService from '../../src/modules/inventory/inventory.service';
import * as repository from '../../src/modules/inventory/inventory.repository';
import { prisma } from '../../src/core/database';

jest.mock('../../src/modules/inventory/inventory.repository');
jest.mock('../../src/core/database', () => ({
  prisma: {
    product: { findFirst: jest.fn() },
    warehouse: { findFirst: jest.fn() },
  },
}));

const mockedRepository = repository as jest.Mocked<typeof repository>;
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('inventory.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('adjustStock', () => {
    it('adjusts stock successfully', async () => {
      mockedRepository.upsertStockAndCreateMovement.mockResolvedValue({
        stock: {
          id: 'stk_1',
          organizationId: 'org_1',
          productId: 'prod_1',
          warehouseId: 'wh_1',
          quantity: new Decimal(10),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        movement: {
          id: 'mov_1',
          organizationId: 'org_1',
          productId: 'prod_1',
          warehouseId: 'wh_1',
          type: StockMovementType.ADJUSTMENT,
          quantity: new Decimal(10),
          balanceAfter: new Decimal(10),
          unitCost: null,
          note: null,
          referenceType: null,
          referenceId: null,
          createdById: null,
          createdAt: new Date(),
        },
      });

      const result = await inventoryService.adjustStock('org_1', {
        productId: 'prod_1',
        warehouseId: 'wh_1',
        quantity: 10,
      });

      expect(result.stock.quantity).toBe(10);
      expect(result.movement.balanceAfter).toBe(10);
      expect(result.movement.type).toBe('ADJUSTMENT');
    });

    it('throws on negative stock result', async () => {
      mockedRepository.upsertStockAndCreateMovement.mockRejectedValue(
        new Error('NEGATIVE_STOCK'),
      );

      await expect(
        inventoryService.adjustStock('org_1', {
          productId: 'prod_1',
          warehouseId: 'wh_1',
          quantity: -100,
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('createAdjustment', () => {
    it('validates product belongs to org', async () => {
      (mockedPrisma.product.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        inventoryService.createAdjustment('org_1', {
          productId: 'invalid',
          warehouseId: 'wh_1',
          quantity: 5,
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('validates warehouse belongs to org', async () => {
      (mockedPrisma.product.findFirst as jest.Mock).mockResolvedValue({
        id: 'prod_1',
      });
      (mockedPrisma.warehouse.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        inventoryService.createAdjustment('org_1', {
          productId: 'prod_1',
          warehouseId: 'invalid',
          quantity: 5,
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('getStocks', () => {
    it('returns paginated stocks', async () => {
      mockedRepository.findStocks.mockResolvedValue([
        [
          {
            id: 'stk_1',
            organizationId: 'org_1',
            productId: 'prod_1',
            warehouseId: 'wh_1',
            quantity: new Decimal(50),
            createdAt: new Date(),
            updatedAt: new Date(),
            product: { name: 'Widget', sku: 'W-01', reorderLevel: new Decimal(10) },
            warehouse: { name: 'Main' },
          },
        ],
        1,
      ] as never);

      const result = await inventoryService.getStocks('org_1', {
        page: 1,
        limit: 10,
      });

      expect(result.stocks).toHaveLength(1);
      expect(result.stocks[0].productName).toBe('Widget');
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getMovements', () => {
    it('returns paginated movements', async () => {
      mockedRepository.findMovements.mockResolvedValue([
        [
          {
            id: 'mov_1',
            organizationId: 'org_1',
            productId: 'prod_1',
            warehouseId: 'wh_1',
            type: StockMovementType.ADJUSTMENT,
            quantity: new Decimal(5),
            balanceAfter: new Decimal(50),
            unitCost: null,
            note: 'test',
            referenceType: null,
            referenceId: null,
            createdById: null,
            createdAt: new Date(),
            product: { name: 'Widget' },
            warehouse: { name: 'Main' },
          },
        ],
        1,
      ] as never);

      const result = await inventoryService.getMovements('org_1', {
        page: 1,
        limit: 10,
      });

      expect(result.movements).toHaveLength(1);
      expect(result.movements[0].type).toBe('ADJUSTMENT');
      expect(result.meta.total).toBe(1);
    });
  });
});
