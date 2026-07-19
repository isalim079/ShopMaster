import { Router } from 'express';

import * as authController from './auth.controller';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  resendOtpSchema,
  verifyEmailSchema,
  verifyResetOtpSchema,
} from './auth.validation';
import { validate } from '../../core/middleware/validate.middleware';

const router = Router();

router.post(
  '/register',
  validate(registerSchema),
  authController.register,
);

router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  authController.verifyEmail,
);

router.post(
  '/login',
  validate(loginSchema),
  authController.login,
);

router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  authController.refreshToken,
);

router.post(
  '/logout',
  validate(refreshTokenSchema),
  authController.logout,
);

router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

router.post(
  '/verify-reset-otp',
  validate(verifyResetOtpSchema),
  authController.verifyResetOtp,
);

router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword,
);

router.post(
  '/resend-verification',
  validate(resendOtpSchema),
  authController.resendVerificationOtp,
);

export default router;