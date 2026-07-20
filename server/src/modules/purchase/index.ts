import { Router } from 'express';

import purchaseRoute from './purchase.route';

const router = Router();

router.use('/purchases', purchaseRoute);

export default router;
