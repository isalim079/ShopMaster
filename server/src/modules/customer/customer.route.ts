import { Router } from 'express';

import * as customerController from './customer.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createCustomerSchema,
  customerIdSchema,
  listCustomersSchema,
  updateCustomerSchema,
} from './customer.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.post(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.CUSTOMERS_WRITE),
  validate(createCustomerSchema),
  customerController.createCustomer,
);

router.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.CUSTOMERS_READ),
  validate(listCustomersSchema),
  customerController.getCustomers,
);

router.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.CUSTOMERS_READ),
  validate(customerIdSchema),
  customerController.getCustomerById,
);

router.patch(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.CUSTOMERS_WRITE),
  validate(updateCustomerSchema),
  customerController.updateCustomer,
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.CUSTOMERS_DELETE),
  validate(customerIdSchema),
  customerController.deleteCustomer,
);

export default router;
