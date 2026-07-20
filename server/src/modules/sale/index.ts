import { Router } from 'express';

import saleRoute from './sale.route';

const router = Router();

router.use('/sales', saleRoute);

export default router;
