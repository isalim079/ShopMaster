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
import { rateLimit } from '../../core/middleware/rate-limit.middleware';

const router = Router();

const forgotPasswordLimiter = rateLimit({
  keyPrefix: 'auth:forgot-password',
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many password reset attempts. Please try again later.',
});

const verifyResetOtpLimiter = rateLimit({
  keyPrefix: 'auth:verify-reset-otp',
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many OTP attempts. Please try again later.',
});

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
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

router.post(
  '/verify-reset-otp',
  verifyResetOtpLimiter,
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
