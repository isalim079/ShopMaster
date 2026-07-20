import { Router } from 'express';

import uploadRoute from './upload.route';

const router = Router();

router.use('/uploads', uploadRoute);

export default router;
