import { Router } from 'express';
import dashboardRoute from './dashboard.route';
const router = Router();
router.use('/dashboard', dashboardRoute);
export default router;
