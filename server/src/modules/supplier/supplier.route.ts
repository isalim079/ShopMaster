import { Router } from 'express';

import * as supplierController from './supplier.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createSupplierSchema,
  supplierIdSchema,
  listSuppliersSchema,
  updateSupplierSchema,
} from './supplier.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.post(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.SUPPLIERS_WRITE),
  validate(createSupplierSchema),
  supplierController.createSupplier,
);

router.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.SUPPLIERS_READ),
  validate(listSuppliersSchema),
  supplierController.getSuppliers,
);

router.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.SUPPLIERS_READ),
  validate(supplierIdSchema),
  supplierController.getSupplierById,
);

router.patch(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.SUPPLIERS_WRITE),
  validate(updateSupplierSchema),
  supplierController.updateSupplier,
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.SUPPLIERS_DELETE),
  validate(supplierIdSchema),
  supplierController.deleteSupplier,
);

export default router;
