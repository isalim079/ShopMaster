import { DocumentStatus, StockMovementType } from '@prisma/client';

import { AppError } from '../../src/core/errors/app-error';
import * as purchaseReturnService from '../../src/modules/purchase-return/purchase-return.service';
import * as repository from '../../src/modules/purchase-return/purchase-return.repository';
import { adjustStock } from '../../src/modules/inventory/inventory.service';
import { nextDocumentNumber } from '../../src/core/utils/document-number';
import { prisma } from '../../src/core/database';

jest.mock('../../src/modules/purchase-return/purchase-return.repository');
jest.mock('../../src/modules/inventory/inventory.service');
jest.mock('../../src/core/utils/document-number');
jest.mock('../../src/core/database', () => ({
  prisma: {
    purchase: { findFirst: jest.fn() },
    purchaseReturnItem: { findMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const mockedRepository = repository as jest.Mocked<typeof repository>;
const mockedAdjustStock = adjustStock as jest.MockedFunction<typeof adjustStock>;
const mockedNextNumber = nextDocumentNumber as jest.MockedFunction<
  typeof nextDocumentNumber
>;
const mockedPrisma = prisma as unknown as {
  purchase: { findFirst: jest.Mock };
  purchaseReturnItem: { findMany: jest.Mock };
  $transaction: jest.Mock;
};

const basePurchase = {
  id: 'pur_1',
  organizationId: 'org_1',
  supplierId: 'sup_1',
  warehouseId: 'wh_1',
  number: 'PO-0001',
  status: DocumentStatus.RECEIVED,
  items: [
    {
      id: 'pi_1',
      purchaseId: 'pur_1',
      productId: 'prod_1',
      quantity: 10,
      receivedQty: 10,
      unitCost: 8,
      taxRate: 0,
      discount: 0,
      lineTotal: 80,
    },
  ],
};

const baseReturn = {
  id: 'pr_1',
  organizationId: 'org_1',
  purchaseId: 'pur_1',
  supplierId: 'sup_1',
  warehouseId: 'wh_1',
  number: 'PR-0001',
  status: DocumentStatus.COMPLETED,
  returnDate: new Date(),
  subtotal: 24,
  taxAmount: 0,
  total: 24,
  notes: null,
  createdById: 'user_1',
  createdAt: new Date(),
  updatedAt: new Date(),
  supplier: { id: 'sup_1', name: 'Acme' },
  warehouse: { id: 'wh_1', name: 'Main' },
  purchase: { id: 'pur_1', number: 'PO-0001' },
  items: [
    {
      id: 'pri_1',
      purchaseReturnId: 'pr_1',
      productId: 'prod_1',
      purchaseItemId: 'pi_1',
      quantity: 3,
      unitCost: 8,
      lineTotal: 24,
      createdAt: new Date(),
      product: { name: 'Rice' },
    },
  ],
};

describe('purchase-return.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPrisma.purchase.findFirst.mockResolvedValue(basePurchase);
    mockedPrisma.purchaseReturnItem.findMany.mockResolvedValue([]);
    mockedNextNumber.mockResolvedValue('PR-0001');
  });

  it('creates return and adjusts stock OUT', async () => {
    mockedPrisma.$transaction.mockImplementation(async (fn) =>
      fn({
        purchaseReturn: {
          create: jest.fn().mockResolvedValue(baseReturn),
        },
      }),
    );

    const result = await purchaseReturnService.createPurchaseReturn('org_1', {
      purchaseId: 'pur_1',
      items: [{ purchaseItemId: 'pi_1', quantity: 3 }],
    });

    expect(result.number).toBe('PR-0001');
    expect(mockedAdjustStock).toHaveBeenCalledTimes(1);
    const arg = mockedAdjustStock.mock.calls[0]?.[1] as {
      quantity: number;
      type: StockMovementType;
      allowNegative?: boolean;
    };
    expect(arg.quantity).toBe(-3);
    expect(arg.type).toBe(StockMovementType.PURCHASE_RETURN);
    expect(arg.allowNegative).toBe(false);
  });

  it('rejects when purchase is not returnable', async () => {
    mockedPrisma.purchase.findFirst.mockResolvedValue({
      ...basePurchase,
      status: DocumentStatus.DRAFT,
    });

    await expect(
      purchaseReturnService.createPurchaseReturn('org_1', {
        purchaseId: 'pur_1',
        items: [{ purchaseItemId: 'pi_1', quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('rejects when quantity exceeds returnable including priors', async () => {
    mockedPrisma.purchaseReturnItem.findMany.mockResolvedValue([
      { purchaseItemId: 'pi_1', quantity: 8 },
    ]);

    await expect(
      purchaseReturnService.createPurchaseReturn('org_1', {
        purchaseId: 'pur_1',
        items: [{ purchaseItemId: 'pi_1', quantity: 5 }],
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('returns not found for unknown id', async () => {
    mockedRepository.findById.mockResolvedValue(null);
    await expect(
      purchaseReturnService.getPurchaseReturnById('org_1', 'x'),
    ).rejects.toBeInstanceOf(AppError);
  });
});
