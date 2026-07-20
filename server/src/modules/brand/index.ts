import { Router } from 'express';

import brandRoute from './brand.route';

const router = Router();

router.use('/brands', brandRoute);

export default router;
