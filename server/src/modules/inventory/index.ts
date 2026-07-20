import { Router } from 'express';

import inventoryRoute from './inventory.route';

const router = Router();

router.use('/inventory', inventoryRoute);

export default router;
