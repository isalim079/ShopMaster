import { Router } from 'express';

import * as saleReturnController from './sale-return.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createSaleReturnSchema,
  listSaleReturnsSchema,
  saleReturnIdSchema,
} from './sale-return.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.post(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.SALE_RETURNS_WRITE),
  validate(createSaleReturnSchema),
  saleReturnController.createSaleReturn,
);

router.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.SALE_RETURNS_READ),
  validate(listSaleReturnsSchema),
  saleReturnController.getSaleReturns,
);

router.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.SALE_RETURNS_READ),
  validate(saleReturnIdSchema),
  saleReturnController.getSaleReturnById,
);

export default router;
