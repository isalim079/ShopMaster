import { Router } from 'express';

import customerRoute from './customer.route';

const router = Router();

router.use('/customers', customerRoute);

export default router;
