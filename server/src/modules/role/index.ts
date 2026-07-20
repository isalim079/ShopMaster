import { Router } from 'express';

import roleRoute from './role.route';

const router = Router();

router.use('/roles', roleRoute);

export default router;
