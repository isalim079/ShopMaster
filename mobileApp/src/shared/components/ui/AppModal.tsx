import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  View,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/shared/components/ui/Text';
import { Button } from '@/src/shared/components/ui/Button';
import {
  hideAppModal,
  registerModalController,
  showAppModal,
  showConfirmModal,
  type AppModalButton,
  type AppModalOptions,
  type AppModalVariant,
} from '@/src/shared/utils/modal';
import { cn } from '@/src/theme/cn';
import { colors } from '@/src/theme/tokens';

type ActiveModal = AppModalOptions & { id: number };

const variantConfig: Record<
  AppModalVariant,
  {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor: string;
    badgeClass: string;
  }
> = {
  success: {
    icon: 'check-circle-outline',
    iconColor: colors.brand.success,
    badgeClass: 'bg-primary-container',
  },
  error: {
    icon: 'alert-circle-outline',
    iconColor: colors.brand.danger,
    badgeClass: 'bg-danger/10',
  },
  warning: {
    icon: 'alert-outline',
    iconColor: colors.brand.warning,
    badgeClass: 'bg-warning/10',
  },
  info: {
    icon: 'information-outline',
    iconColor: colors.brand.info,
    badgeClass: 'bg-surface-dim dark:bg-surface-dark',
  },
};

function mapButtonVariant(
  style: AppModalButton['style'],
): 'primary' | 'outline' | 'danger' | 'ghost' {
  if (style === 'destructive') return 'danger';
  if (style === 'cancel') return 'outline';
  return 'primary';
}

export function AppModalProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [modal, setModal] = useState<ActiveModal | null>(null);
  const [busyIndex, setBusyIndex] = useState<number | null>(null);
  const idRef = useRef(0);

  const close = useCallback(() => {
    setBusyIndex(null);
    setModal(null);
  }, []);

  // Bridge imperative modal API to React state
  useEffect(() => {
    registerModalController((options) => {
      if (!options) {
        close();
        return;
      }
      idRef.current += 1;
      setBusyIndex(null);
      setModal({ ...options, id: idRef.current });
    });
    return () => registerModalController(null);
  }, [close]);

  const onBackdropPress = useCallback(() => {
    if (modal?.dismissOnBackdrop) {
      hideAppModal();
    }
  }, [modal?.dismissOnBackdrop]);

  const onButtonPress = useCallback(
    async (button: AppModalButton, index: number) => {
      if (busyIndex != null) return;
      setBusyIndex(index);
      try {
        await button.onPress?.();
      } finally {
        hideAppModal();
      }
    },
    [busyIndex],
  );

  const variant = modal?.variant ?? 'info';
  const style = variantConfig[variant];
  const buttons = modal?.buttons ?? [];
  const isRowActions = buttons.length === 2;

  return (
    <>
      {children}

      <Modal
        visible={modal != null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onBackdropPress}
      >
        {/* Backdrop overlay */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close dialog"
          onPress={onBackdropPress}
          className="flex-1 items-center justify-center bg-black/45 px-6"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          {/* Modal card */}
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-lg dark:border-border-dark dark:bg-surface-dark"
            style={{ maxWidth: Math.min(width - 48, 400) }}
          >
            <View className="items-center px-6 pb-6 pt-8">
              {/* Status icon */}
              <View
                className={cn(
                  'mb-5 h-16 w-16 items-center justify-center rounded-full',
                  style.badgeClass,
                )}
              >
                <MaterialCommunityIcons
                  name={style.icon}
                  size={32}
                  color={style.iconColor}
                />
              </View>

              {/* Title + message */}
              <AppText variant="title" className="text-center">
                {modal?.title}
              </AppText>
              {modal?.message ? (
                <AppText variant="caption" className="mt-2 text-center">
                  {modal.message}
                </AppText>
              ) : null}
            </View>

            {/* Action buttons */}
            <View
              className={cn(
                'border-t border-divider px-5 py-4 dark:border-border-dark',
                isRowActions ? 'flex-row gap-3' : 'gap-3',
              )}
            >
              {buttons.map((button, index) => (
                <Button
                  key={`${button.text}-${index}`}
                  label={button.text}
                  variant={mapButtonVariant(button.style)}
                  size="md"
                  className={isRowActions ? 'flex-1' : undefined}
                  loading={busyIndex === index}
                  disabled={busyIndex != null && busyIndex !== index}
                  onPress={() => onButtonPress(button, index)}
                />
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export function useAppModal() {
  return { showAppModal, showConfirmModal, hideAppModal };
}

export { showAppModal, showConfirmModal, hideAppModal };
