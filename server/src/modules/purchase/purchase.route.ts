import { Router } from 'express';

import * as purchaseController from './purchase.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createPurchaseSchema,
  listPurchasesSchema,
  purchaseIdSchema,
  receivePurchaseSchema,
  updatePurchaseSchema,
} from './purchase.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.post(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.PURCHASES_WRITE),
  validate(createPurchaseSchema),
  purchaseController.createPurchase,
);

router.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.PURCHASES_READ),
  validate(listPurchasesSchema),
  purchaseController.getPurchases,
);

router.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.PURCHASES_READ),
  validate(purchaseIdSchema),
  purchaseController.getPurchaseById,
);

router.patch(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.PURCHASES_WRITE),
  validate(updatePurchaseSchema),
  purchaseController.updatePurchase,
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.PURCHASES_DELETE),
  validate(purchaseIdSchema),
  purchaseController.cancelPurchase,
);

router.post(
  '/:id/receive',
  authenticate,
  requirePermission(PERMISSION_SLUG.PURCHASES_WRITE),
  validate(receivePurchaseSchema),
  purchaseController.receivePurchase,
);

export default router;
