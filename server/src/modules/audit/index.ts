import { Router } from 'express';

import auditRoute from './audit.route';

const router = Router();

router.use('/audit-logs', auditRoute);

export default router;
