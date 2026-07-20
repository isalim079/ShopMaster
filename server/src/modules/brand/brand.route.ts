import { Router } from 'express';

import * as brandController from './brand.controller';
import {
  authenticate,
  requirePermission,
} from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createBrandSchema,
  brandIdSchema,
  listBrandsSchema,
  updateBrandSchema,
} from './brand.validation';
import { PERMISSION_SLUG } from '../../core/constants/permissions';

const router = Router();

router.post(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.BRANDS_WRITE),
  validate(createBrandSchema),
  brandController.createBrand,
);

router.get(
  '/',
  authenticate,
  requirePermission(PERMISSION_SLUG.BRANDS_READ),
  validate(listBrandsSchema),
  brandController.getBrands,
);

router.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.BRANDS_READ),
  validate(brandIdSchema),
  brandController.getBrandById,
);

router.patch(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.BRANDS_WRITE),
  validate(updateBrandSchema),
  brandController.updateBrand,
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSION_SLUG.BRANDS_DELETE),
  validate(brandIdSchema),
  brandController.deleteBrand,
);

export default router;
