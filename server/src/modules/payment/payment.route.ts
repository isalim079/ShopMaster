import { Router } from 'express';

import * as paymentController from './payment.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createPaymentSchema,
  listPaymentsSchema,
  paymentIdSchema,
} from './payment.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.post(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.PAYMENTS_WRITE),
  validate(createPaymentSchema),
  paymentController.createPayment,
);

router.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.PAYMENTS_READ),
  validate(listPaymentsSchema),
  paymentController.getPayments,
);

router.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.PAYMENTS_READ),
  validate(paymentIdSchema),
  paymentController.getPaymentById,
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.PAYMENTS_DELETE),
  validate(paymentIdSchema),
  paymentController.deletePayment,
);

export default router;
