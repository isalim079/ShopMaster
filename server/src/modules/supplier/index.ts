import { Router } from 'express';

import supplierRoute from './supplier.route';

const router = Router();

router.use('/suppliers', supplierRoute);

export default router;
