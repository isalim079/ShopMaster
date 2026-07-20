import { Router } from 'express';
import reportRoute from './report.route';
const router = Router();
router.use('/reports', reportRoute);
export default router;
