import { Router } from 'express';

import * as purchaseReturnController from './purchase-return.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createPurchaseReturnSchema,
  listPurchaseReturnsSchema,
  purchaseReturnIdSchema,
} from './purchase-return.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.post(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.PURCHASE_RETURNS_WRITE),
  validate(createPurchaseReturnSchema),
  purchaseReturnController.createPurchaseReturn,
);

router.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.PURCHASE_RETURNS_READ),
  validate(listPurchaseReturnsSchema),
  purchaseReturnController.getPurchaseReturns,
);

router.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.PURCHASE_RETURNS_READ),
  validate(purchaseReturnIdSchema),
  purchaseReturnController.getPurchaseReturnById,
);

export default router;
