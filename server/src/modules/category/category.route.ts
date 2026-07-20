import { Router } from 'express';

import * as categoryController from './category.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createCategorySchema,
  categoryIdSchema,
  listCategoriesSchema,
  updateCategorySchema,
} from './category.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.post(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.CATEGORIES_WRITE),
  validate(createCategorySchema),
  categoryController.createCategory,
);

router.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.CATEGORIES_READ),
  validate(listCategoriesSchema),
  categoryController.getCategories,
);

router.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.CATEGORIES_READ),
  validate(categoryIdSchema),
  categoryController.getCategoryById,
);

router.patch(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.CATEGORIES_WRITE),
  validate(updateCategorySchema),
  categoryController.updateCategory,
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.CATEGORIES_DELETE),
  validate(categoryIdSchema),
  categoryController.deleteCategory,
);

export default router;
