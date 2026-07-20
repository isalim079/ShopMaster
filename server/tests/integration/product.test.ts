import request from 'supertest';
import { CatalogStatus } from '@prisma/client';

import app from '../../src/app';
import * as productService from '../../src/modules/product/product.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/product/product.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
      organizationId: 'org_1',
      permissions: ['products:read', 'products:write', 'products:delete'],
    };
    next();
  }),
  authorize: jest.fn(
    () => (_req: unknown, _res: unknown, next: () => void) => next(),
  ),
  requirePermission: jest.fn(
    () => (_req: unknown, _res: unknown, next: () => void) => next(),
  ),
}));

const mockedProductService =
  productService as jest.Mocked<typeof productService>;

describe('Products API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticate as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user_1',
        email: 'admin@example.com',
        role: ROLE_SLUG.ADMIN,
        roleId: 'role_admin',
        organizationId: 'org_1',
        permissions: ['products:read', 'products:write', 'products:delete'],
      };
      next();
    });
    (authorize as jest.Mock).mockImplementation(
      () => (_req: unknown, _res: unknown, next: () => void) => next(),
    );
    (requirePermission as jest.Mock).mockImplementation(
      () => (_req: unknown, _res: unknown, next: () => void) => next(),
    );
  });

  it('POST /api/v1/products creates product', async () => {
    mockedProductService.createProduct.mockResolvedValue({
      id: 'prod_1',
      organizationId: 'org_1',
      name: 'Widget',
      sku: 'W-001',
      barcode: null,
      description: null,
      categoryId: null,
      brandId: null,
      unit: 'PCS',
      purchasePrice: 100,
      salePrice: 150,
      taxRate: 0,
      reorderLevel: null,
      imageUrl: null,
      status: CatalogStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app)
      .post('/api/v1/products')
      .send({ name: 'Widget', purchasePrice: 100, salePrice: 150 });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Widget');
  });

  it('GET /api/v1/products returns list', async () => {
    mockedProductService.getProducts.mockResolvedValue({
      products: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get('/api/v1/products');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it('GET /api/v1/products/search returns search results', async () => {
    mockedProductService.getProducts.mockResolvedValue({
      products: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app)
      .get('/api/v1/products/search')
      .query({ search: 'widget' });

    expect(response.status).toBe(200);
  });

  it('GET /api/v1/products/:id returns product detail', async () => {
    mockedProductService.getProductById.mockResolvedValue({
      id: 'prod_1',
      organizationId: 'org_1',
      name: 'Widget',
      sku: 'W-001',
      barcode: null,
      description: null,
      categoryId: null,
      brandId: null,
      unit: 'PCS',
      purchasePrice: 100,
      salePrice: 150,
      taxRate: 0,
      reorderLevel: null,
      imageUrl: null,
      status: CatalogStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalStock: 50,
      stocks: [{ warehouseId: 'wh_1', warehouseName: 'Main', quantity: 50 }],
    });

    const response = await request(app).get('/api/v1/products/prod_1');

    expect(response.status).toBe(200);
    expect(response.body.data.totalStock).toBe(50);
  });

  it('PATCH /api/v1/products/:id updates product', async () => {
    mockedProductService.updateProduct.mockResolvedValue({
      id: 'prod_1',
      organizationId: 'org_1',
      name: 'Updated Widget',
      sku: 'W-001',
      barcode: null,
      description: null,
      categoryId: null,
      brandId: null,
      unit: 'PCS',
      purchasePrice: 100,
      salePrice: 200,
      taxRate: 0,
      reorderLevel: null,
      imageUrl: null,
      status: CatalogStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app)
      .patch('/api/v1/products/prod_1')
      .send({ name: 'Updated Widget', salePrice: 200 });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Updated Widget');
  });

  it('DELETE /api/v1/products/:id deactivates product', async () => {
    mockedProductService.deleteProduct.mockResolvedValue({
      message: 'Product deactivated successfully.',
    });

    const response = await request(app).delete('/api/v1/products/prod_1');

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('deactivated');
  });

  it('PATCH /api/v1/products/:id/stock adjusts stock', async () => {
    mockedProductService.adjustProductStock.mockResolvedValue({
      stock: { productId: 'prod_1', warehouseId: 'wh_1', quantity: 15 },
      movement: { id: 'mov_1', type: 'ADJUSTMENT' as never, quantity: 5, balanceAfter: 15 },
    });

    const response = await request(app)
      .patch('/api/v1/products/prod_1/stock')
      .send({ warehouseId: 'wh_1', quantity: 5 });

    expect(response.status).toBe(200);
    expect(response.body.data.stock.quantity).toBe(15);
  });
});
