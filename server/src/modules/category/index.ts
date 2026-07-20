import { Router } from 'express';

import categoryRoute from './category.route';

const router = Router();

router.use('/categories', categoryRoute);

export default router;
