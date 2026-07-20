import { Router } from 'express';

import paymentRoute from './payment.route';

const router = Router();

router.use('/payments', paymentRoute);

export default router;
