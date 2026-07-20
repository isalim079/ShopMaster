import { Router } from 'express';

import * as saleController from './sale.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createSaleSchema,
  listSalesSchema,
  saleIdSchema,
  updateSaleSchema,
} from './sale.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.post(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.SALES_WRITE),
  validate(createSaleSchema),
  saleController.createSale,
);

router.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.SALES_READ),
  validate(listSalesSchema),
  saleController.getSales,
);

router.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.SALES_READ),
  validate(saleIdSchema),
  saleController.getSaleById,
);

router.get(
  '/:id/invoice',
  authenticate,
  requirePermission(PERMISSION_SLUG.SALES_READ),
  validate(saleIdSchema),
  saleController.getSaleInvoice,
);

router.patch(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.SALES_WRITE),
  validate(updateSaleSchema),
  saleController.updateSale,
);

router.post(
  '/:id/complete',
  authenticate,
  requirePermission(PERMISSION_SLUG.SALES_WRITE),
  validate(saleIdSchema),
  saleController.completeSale,
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.SALES_DELETE),
  validate(saleIdSchema),
  saleController.cancelSale,
);

export default router;
