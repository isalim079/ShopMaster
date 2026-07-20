import { Router } from 'express';

import warehouseRoute from './warehouse.route';

const router = Router();

router.use('/warehouses', warehouseRoute);

export default router;
