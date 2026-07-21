import { useEffect, useRef } from 'react';

import {
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/src/features/auth/services/tokenStorage';
import {
  clearSession,
  setHydrated,
  setSession,
  type AuthUser,
} from '@/src/features/auth/slices/authSlice';
import { useAppDispatch } from '@/src/store/hooks';
import { env } from '@/src/shared/config/env';
import { decodeJwtPayload } from './jwt';

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function bootstrap() {
      try {
        const tokenPromise = Promise.all([
          getAccessToken(),
          getRefreshToken(),
        ]);
        const timeoutPromise = new Promise<[null, null]>((resolve) => {
          setTimeout(() => resolve([null, null]), 3000);
        });
        const [accessToken, refreshToken] = await Promise.race([
          tokenPromise,
          timeoutPromise,
        ]);

        if (!accessToken || !refreshToken) {
          dispatch(clearSession());
          return;
        }

        const payload = decodeJwtPayload(accessToken);
        const exp = typeof payload?.exp === 'number' ? payload.exp : 0;
        const expired = exp * 1000 < Date.now();

        if (expired) {
          const controller = new AbortController();
          const abortTimer = setTimeout(() => controller.abort(), 5000);
          try {
            const response = await fetch(
              `${env.API_BASE_URL}/auth/refresh-token`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
                signal: controller.signal,
              },
            );

            if (!response.ok) {
              dispatch(clearSession());
              return;
            }

            const json = (await response.json()) as {
              data?: {
                tokens?: { accessToken: string; refreshToken: string };
                user?: AuthUser;
              };
            };

            if (!json.data?.tokens) {
              dispatch(clearSession());
              return;
            }

            await setTokens(json.data.tokens);

            if (json.data.user) {
              dispatch(setSession(json.data.user));
            } else {
              dispatch(setHydrated(true));
            }
          } finally {
            clearTimeout(abortTimer);
          }
          return;
        }

        dispatch(
          setSession({
            id: String(payload?.userId ?? ''),
            firstName: 'User',
            lastName: null,
            email: String(payload?.email ?? ''),
            phone: null,
            status: 'ACTIVE',
            isEmailVerified: true,
            role: {
              id: '',
              name: String(payload?.role ?? ''),
              slug: String(payload?.role ?? ''),
            },
            organization: { id: '', name: '', slug: '' },
            createdAt: '',
            updatedAt: '',
          }),
        );
      } catch {
        dispatch(clearSession());
      }
    }

    void bootstrap();
  }, [dispatch]);
}
