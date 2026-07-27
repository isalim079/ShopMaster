import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { cn } from '@/src/theme/cn';
import { colors } from '@/src/theme/tokens';

type ToastVariant = 'info' | 'success' | 'error';

type ToastPayload = {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (payload: ToastPayload | string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<
  ToastVariant,
  { wrap: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }
> = {
  info: {
    wrap: 'border-border bg-surface dark:border-border-dark dark:bg-surface-dark',
    icon: 'information-outline',
    color: colors.brand.info,
  },
  success: {
    wrap: 'border-success/30 bg-primary-container',
    icon: 'check-circle-outline',
    color: colors.brand.success,
  },
  error: {
    wrap: 'border-danger/30 bg-danger/10',
    icon: 'alert-circle-outline',
    color: colors.brand.danger,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<(ToastPayload & { id: number }) | null>(
    null,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (payload: ToastPayload | string) => {
      const next: ToastPayload =
        typeof payload === 'string' ? { message: payload } : payload;
      const id = ++idRef.current;
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({
        id,
        message: next.message,
        variant: next.variant ?? 'info',
        durationMs: next.durationMs ?? 3200,
      });
      timerRef.current = setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
        timerRef.current = null;
      }, next.durationMs ?? 3200);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);
  const style = toast ? variantStyles[toast.variant ?? 'info'] : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && style ? (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            top: Math.max(insets.top, 12) + 8,
            zIndex: 1000,
          }}
        >
          <Pressable
            accessibilityRole="alert"
            onPress={hide}
            className={cn(
              'flex-row items-start gap-3 rounded-lg border px-4 py-3 shadow-md',
              style.wrap,
            )}
            style={{ elevation: 4 }}
          >
            <MaterialCommunityIcons
              name={style.icon}
              size={20}
              color={style.color}
            />
            <Text className="flex-1 font-sans-medium text-body text-foreground dark:text-foreground-dark">
              {toast.message}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
