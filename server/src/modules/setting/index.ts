import { Router } from 'express';

import settingRoute from './setting.route';

const router = Router();

router.use('/settings', settingRoute);

export default router;
