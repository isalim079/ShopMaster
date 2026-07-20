import { Router } from 'express';

import purchaseReturnRoute from './purchase-return.route';

const router = Router();

router.use('/purchase-returns', purchaseReturnRoute);

export default router;
