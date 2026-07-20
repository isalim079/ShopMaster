import { Router } from 'express';
import * as reportController from './report.controller';
import { authenticate, requirePermission } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  expensesReportSchema, inventoryReportSchema, profitLossSchema, purchasesReportSchema, salesReportSchema,
} from './report.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();
const guard = [authenticate, requirePermission(PERMISSION_SLUG.REPORTS_READ)];

router.get('/sales', ...guard, validate(salesReportSchema), reportController.sales);
router.get('/purchases', ...guard, validate(purchasesReportSchema), reportController.purchases);
router.get('/inventory', ...guard, validate(inventoryReportSchema), reportController.inventory);
router.get('/expenses', ...guard, validate(expensesReportSchema), reportController.expenses);
router.get('/profit-loss', ...guard, validate(profitLossSchema), reportController.profitLoss);

export default router;
