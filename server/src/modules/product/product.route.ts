import { Router } from 'express';

import * as productController from './product.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createProductSchema,
  productIdSchema,
  listProductsSchema,
  updateProductSchema,
  adjustProductStockSchema,
} from './product.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.post(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.PRODUCTS_WRITE),
  validate(createProductSchema),
  productController.createProduct,
);

router.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.PRODUCTS_READ),
  validate(listProductsSchema),
  productController.getProducts,
);

router.get(
  '/search',
  authenticate,
  requirePermission(PERMISSION_SLUG.PRODUCTS_READ),
  validate(listProductsSchema),
  productController.searchProducts,
);

router.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.PRODUCTS_READ),
  validate(productIdSchema),
  productController.getProductById,
);

router.patch(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.PRODUCTS_WRITE),
  validate(updateProductSchema),
  productController.updateProduct,
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.PRODUCTS_DELETE),
  validate(productIdSchema),
  productController.deleteProduct,
);

router.patch(
  '/:id/stock',
  authenticate,
  requirePermission(PERMISSION_SLUG.PRODUCTS_WRITE),
  validate(adjustProductStockSchema),
  productController.adjustProductStock,
);

export default router;
