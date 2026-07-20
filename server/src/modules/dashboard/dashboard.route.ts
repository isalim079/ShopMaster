import { Router } from 'express';

import * as dashboardController from './dashboard.controller';
import { authenticate, requirePermission } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  seriesQuerySchema,
  topCustomersQuerySchema,
  topProductsQuerySchema,
} from './dashboard.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();
const guard = [authenticate, requirePermission(PERMISSION_SLUG.DASHBOARD_READ)];

router.get('/summary', ...guard, dashboardController.getSummary);
router.get('/today', ...guard, dashboardController.getToday);
router.get('/weekly', ...guard, dashboardController.getWeekly);
router.get('/monthly', ...guard, dashboardController.getMonthly);
router.get('/charts', ...guard, validate(seriesQuerySchema), dashboardController.getCharts);
router.get('/top-products', ...guard, validate(topProductsQuerySchema), dashboardController.getTopProducts);
router.get('/top-customers', ...guard, validate(topCustomersQuerySchema), dashboardController.getTopCustomers);

export default router;
