import { Router } from 'express';

import { categoryRouter, expenseRouter } from './expense.route';

const router = Router();

router.use('/expense-categories', categoryRouter);
router.use('/expenses', expenseRouter);

export default router;
