import { Router } from 'express';

import permissionRoute from './permission.route';

const router = Router();

router.use('/permissions', permissionRoute);

export default router;
