import { Router } from 'express';

import organizationRoute from './organization.route';

const router = Router();

router.use('/organizations', organizationRoute);

export default router;
