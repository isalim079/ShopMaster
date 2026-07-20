import { CatalogStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { AppError } from '../../src/core/errors/app-error';
import * as productService from '../../src/modules/product/product.service';
import * as repository from '../../src/modules/product/product.repository';
import { prisma } from '../../src/core/database';

jest.mock('../../src/modules/product/product.repository');
jest.mock('../../src/core/database', () => ({
  prisma: {
    category: { findFirst: jest.fn() },
    brand: { findFirst: jest.fn() },
    warehouse: { findFirst: jest.fn() },
    product: { findFirst: jest.fn() },
  },
}));
jest.mock('../../src/modules/inventory/inventory.service', () => ({
  adjustStock: jest.fn().mockResolvedValue({
    stock: { productId: 'prod_1', warehouseId: 'wh_1', quantity: 10 },
    movement: { id: 'mov_1', type: 'ADJUSTMENT', quantity: 10, balanceAfter: 10 },
  }),
}));

const mockedRepository = repository as jest.Mocked<typeof repository>;
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

const baseProduct = {
  id: 'prod_1',
  organizationId: 'org_1',
  name: 'Test Product',
  sku: 'SKU-001',
  barcode: null,
  description: null,
  categoryId: null,
  brandId: null,
  unit: 'PCS',
  purchasePrice: new Decimal(100),
  salePrice: new Decimal(150),
  taxRate: new Decimal(0),
  reorderLevel: null,
  imageUrl: null,
  status: CatalogStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('product.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates product', async () => {
    mockedRepository.create.mockResolvedValue(baseProduct);

    const result = await productService.createProduct('org_1', {
      name: 'Test Product',
      purchasePrice: 100,
      salePrice: 150,
    });

    expect(result.name).toBe('Test Product');
    expect(result.purchasePrice).toBe(100);
    expect(result.salePrice).toBe(150);
  });

  it('validates categoryId belongs to org', async () => {
    (mockedPrisma.category.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      productService.createProduct('org_1', {
        name: 'Test',
        purchasePrice: 100,
        salePrice: 150,
        categoryId: 'cat_invalid',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('validates brandId belongs to org', async () => {
    (mockedPrisma.brand.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      productService.createProduct('org_1', {
        name: 'Test',
        purchasePrice: 100,
        salePrice: 150,
        brandId: 'brand_invalid',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('throws on duplicate sku', async () => {
    const { Prisma } = jest.requireActual('@prisma/client');
    const error = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      clientVersion: '5.0.0',
    });
    mockedRepository.create.mockRejectedValue(error);

    await expect(
      productService.createProduct('org_1', {
        name: 'Test',
        purchasePrice: 100,
        salePrice: 150,
        sku: 'DUPE',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('throws when product not found', async () => {
    mockedRepository.findByIdWithStocks.mockResolvedValue(null);

    await expect(
      productService.getProductById('org_1', 'missing'),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('soft deletes product', async () => {
    mockedRepository.findById.mockResolvedValue(baseProduct);
    mockedRepository.softDelete.mockResolvedValue({
      ...baseProduct,
      status: CatalogStatus.INACTIVE,
    });

    const result = await productService.deleteProduct('org_1', 'prod_1');
    expect(result.message).toContain('deactivated');
  });

  it('gets product by id with stocks', async () => {
    mockedRepository.findByIdWithStocks.mockResolvedValue({
      ...baseProduct,
      stocks: [
        {
          id: 'stk_1',
          organizationId: 'org_1',
          productId: 'prod_1',
          warehouseId: 'wh_1',
          quantity: new Decimal(25),
          createdAt: new Date(),
          updatedAt: new Date(),
          warehouse: { id: 'wh_1', name: 'Main' },
        },
      ],
    } as never);

    const result = await productService.getProductById('org_1', 'prod_1');
    expect(result.totalStock).toBe(25);
    expect(result.stocks).toHaveLength(1);
    expect(result.stocks![0].warehouseName).toBe('Main');
  });
});
