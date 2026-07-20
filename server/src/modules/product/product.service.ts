import { Prisma } from '@prisma/client';

import * as repository from './product.repository';
import { toProductListResponse, toProductResponse, decimalToNumber } from './product.mapper';
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
  AdjustProductStockInput,
} from './product.validation';
import type { ListProductsResult, ProductDetailResponse } from './product.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { prisma } from '../../core/database';
import { adjustStock } from '../inventory/inventory.service';

export const createProduct = async (
  organizationId: string,
  payload: CreateProductInput,
) => {
  if (payload.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: payload.categoryId, organizationId },
    });
    if (!category) {
      throw new AppError('Category not found in this organization.', HTTP_STATUS.BAD_REQUEST);
    }
  }

  if (payload.brandId) {
    const brand = await prisma.brand.findFirst({
      where: { id: payload.brandId, organizationId },
    });
    if (!brand) {
      throw new AppError('Brand not found in this organization.', HTTP_STATUS.BAD_REQUEST);
    }
  }

  let product;
  try {
    product = await repository.create(organizationId, payload);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new AppError(
        'Product with this SKU already exists.',
        HTTP_STATUS.CONFLICT,
      );
    }
    throw error;
  }

  if (payload.warehouseId && payload.openingStock && payload.openingStock > 0) {
    const warehouse = await prisma.warehouse.findFirst({
      where: { id: payload.warehouseId, organizationId },
    });
    if (!warehouse) {
      throw new AppError('Warehouse not found in this organization.', HTTP_STATUS.BAD_REQUEST);
    }

    await adjustStock(organizationId, {
      productId: product.id,
      warehouseId: payload.warehouseId,
      quantity: payload.openingStock,
      note: 'Opening stock',
    });
  }

  return toProductResponse(product);
};

export const getProducts = async (
  organizationId: string,
  query: ListProductsQuery,
): Promise<ListProductsResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    status?: NonNullable<ListProductsQuery['status']>;
    categoryId?: string;
    brandId?: string;
  } = {};

  if (query.search) filters.search = query.search;
  if (query.status !== undefined) filters.status = query.status;
  if (query.categoryId) filters.categoryId = query.categoryId;
  if (query.brandId) filters.brandId = query.brandId;

  const [products, total] = await repository.findMany(
    organizationId,
    filters,
    skip,
    limit,
  );

  return {
    products: toProductListResponse(products),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getProductById = async (
  organizationId: string,
  id: string,
): Promise<ProductDetailResponse> => {
  const product = await repository.findByIdWithStocks(organizationId, id);

  if (!product) {
    throw new AppError('Product not found.', HTTP_STATUS.NOT_FOUND);
  }

  const totalStock = product.stocks.reduce(
    (sum, s) => sum + decimalToNumber(s.quantity),
    0,
  );

  const stocks = product.stocks.map((s) => ({
    warehouseId: s.warehouse.id,
    warehouseName: s.warehouse.name,
    quantity: decimalToNumber(s.quantity),
  }));

  return {
    ...toProductResponse(product),
    totalStock,
    stocks,
  };
};

export const updateProduct = async (
  organizationId: string,
  id: string,
  payload: UpdateProductInput,
) => {
  const product = await repository.findById(organizationId, id);

  if (!product) {
    throw new AppError('Product not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError('At least one field is required.', HTTP_STATUS.BAD_REQUEST);
  }

  if (payload.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: payload.categoryId, organizationId },
    });
    if (!category) {
      throw new AppError('Category not found in this organization.', HTTP_STATUS.BAD_REQUEST);
    }
  }

  if (payload.brandId) {
    const brand = await prisma.brand.findFirst({
      where: { id: payload.brandId, organizationId },
    });
    if (!brand) {
      throw new AppError('Brand not found in this organization.', HTTP_STATUS.BAD_REQUEST);
    }
  }

  let updated;
  try {
    updated = await repository.update(id, payload);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new AppError(
        'Product with this SKU already exists.',
        HTTP_STATUS.CONFLICT,
      );
    }
    throw error;
  }

  return toProductResponse(updated);
};

export const deleteProduct = async (
  organizationId: string,
  id: string,
) => {
  const product = await repository.findById(organizationId, id);

  if (!product) {
    throw new AppError('Product not found.', HTTP_STATUS.NOT_FOUND);
  }

  await repository.softDelete(id);

  return {
    message: 'Product deactivated successfully.',
  };
};

export const adjustProductStock = async (
  organizationId: string,
  productId: string,
  payload: AdjustProductStockInput,
) => {
  const product = await repository.findById(organizationId, productId);

  if (!product) {
    throw new AppError('Product not found.', HTTP_STATUS.NOT_FOUND);
  }

  const warehouse = await prisma.warehouse.findFirst({
    where: { id: payload.warehouseId, organizationId },
  });
  if (!warehouse) {
    throw new AppError('Warehouse not found in this organization.', HTTP_STATUS.BAD_REQUEST);
  }

  const input: Parameters<typeof adjustStock>[1] = {
    productId,
    warehouseId: payload.warehouseId,
    quantity: payload.quantity,
  };
  if (payload.note !== undefined) input.note = payload.note;

  return adjustStock(organizationId, input);
};
