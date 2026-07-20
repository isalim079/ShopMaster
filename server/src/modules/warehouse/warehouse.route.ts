import { Router } from 'express';

import * as warehouseController from './warehouse.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createWarehouseSchema,
  warehouseIdSchema,
  listWarehousesSchema,
  updateWarehouseSchema,
} from './warehouse.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.post(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.WAREHOUSES_WRITE),
  validate(createWarehouseSchema),
  warehouseController.createWarehouse,
);

router.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.WAREHOUSES_READ),
  validate(listWarehousesSchema),
  warehouseController.getWarehouses,
);

router.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.WAREHOUSES_READ),
  validate(warehouseIdSchema),
  warehouseController.getWarehouseById,
);

router.patch(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.WAREHOUSES_WRITE),
  validate(updateWarehouseSchema),
  warehouseController.updateWarehouse,
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.WAREHOUSES_DELETE),
  validate(warehouseIdSchema),
  warehouseController.deleteWarehouse,
);

export default router;
