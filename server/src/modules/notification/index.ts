import { Router } from 'express';

import notificationRoute from './notification.route';

const router = Router();

router.use('/notifications', notificationRoute);

export default router;
