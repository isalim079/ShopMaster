import { Request, Response } from 'express';



import * as authService from './auth.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { apiResponse } from '../../core/utils/api-response';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { accessTokenCookieOptions, clearCookieOptions, refreshTokenCookieOptions } from '../../core/security/cookie';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);

  return apiResponse({
    res,
    statusCode: HTTP_STATUS.CREATED,
    message: result.message,
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const result = await authService.verifyEmail(email, otp);

  return apiResponse({
    res,
    statusCode: HTTP_STATUS.OK,
    message: result.message,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.cookie(
    'accessToken',
    result.tokens.accessToken,
    accessTokenCookieOptions,
  );

  res.cookie(
    'refreshToken',
    result.tokens.refreshToken,
    refreshTokenCookieOptions,
  );

  return apiResponse({
    res,
    statusCode: HTTP_STATUS.OK,
    message: 'Login successful.',
    data: {
      user: result.user,
    },
  });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken =
      req.cookies.refreshToken ?? req.body.refreshToken;

    const result =
      await authService.refreshToken(refreshToken);

    res.cookie(
      'accessToken',
      result.accessToken,
      accessTokenCookieOptions,
    );

    res.cookie(
      'refreshToken',
      result.refreshToken,
      refreshTokenCookieOptions,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'Token refreshed successfully.',
    });
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken =
    req.cookies.refreshToken ?? req.body.refreshToken;

  const result = await authService.logout(refreshToken);

  res.clearCookie(
    'accessToken',
    clearCookieOptions,
  );

  res.clearCookie(
    'refreshToken',
    clearCookieOptions,
  );

  return apiResponse({
    res,
    statusCode: HTTP_STATUS.OK,
    message: result.message,
  });
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(
      req.body.email,
    );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  },
);

export const verifyResetOtp = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    const result =
      await authService.verifyResetOtp(
        email,
        otp,
      );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: 'OTP verified successfully.',
      data: result,
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { resetToken, password } = req.body;

    const result =
      await authService.resetPassword(
        resetToken,
        password,
      );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  },
);

export const resendVerificationOtp = asyncHandler(
  async (req: Request, res: Response) => {
    const result =
      await authService.resendVerificationOtp(
        req.body.email,
      );

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  },
);