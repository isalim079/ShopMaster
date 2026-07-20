import { Router } from 'express';

import saleReturnRoute from './sale-return.route';

const router = Router();

router.use('/sale-returns', saleReturnRoute);

export default router;
