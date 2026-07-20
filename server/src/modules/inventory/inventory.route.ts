import { Router } from 'express';

import * as inventoryController from './inventory.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  listStocksSchema,
  listMovementsSchema,
  adjustmentSchema,
} from './inventory.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.INVENTORY_READ),
  validate(listStocksSchema),
  inventoryController.getStocks,
);

router.get(
  '/history',
  authenticate,
  requirePermission(PERMISSION_SLUG.INVENTORY_READ),
  validate(listMovementsSchema),
  inventoryController.getMovements,
);

router.post(
  '/adjustment',
  authenticate,
  requirePermission(PERMISSION_SLUG.INVENTORY_WRITE),
  validate(adjustmentSchema),
  inventoryController.createAdjustment,
);

export default router;
