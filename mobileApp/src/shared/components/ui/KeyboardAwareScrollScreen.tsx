import { useEffect, useState, type ReactNode } from 'react';
import { Platform, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  KeyboardAwareScrollView,
  KeyboardEvents,
} from 'react-native-keyboard-controller';

import { cn } from '@/src/theme/cn';

type KeyboardAwareScrollScreenProps = {
  children: ReactNode;
  className?: string;
  contentContainerClassName?: string;
  /** Space between focused input and keyboard top. */
  bottomOffset?: number;
  /** Center short screens only (login). Never use on long forms. */
  centerContent?: boolean;
  scrollViewProps?: Omit<
    ScrollViewProps,
    'children' | 'contentContainerStyle' | 'style'
  >;
};

/**
 * Production keyboard shell powered by `react-native-keyboard-controller`
 * (Expo-recommended). Auto-scrolls focused fields above keyboard on iOS + Android.
 */
export function KeyboardAwareScrollScreen({
  children,
  className,
  contentContainerClassName,
  bottomOffset = 24,
  centerContent = false,
  scrollViewProps,
}: KeyboardAwareScrollScreenProps) {
  const insets = useSafeAreaInsets();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const show = KeyboardEvents.addListener('keyboardWillShow', () => {
      setKeyboardOpen(true);
    });
    const hide = KeyboardEvents.addListener('keyboardWillHide', () => {
      setKeyboardOpen(false);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const useCentering = centerContent && !keyboardOpen;
  const topPad = Math.max(insets.top, 16);
  const bottomPad = Math.max(insets.bottom, 16) + (keyboardOpen ? 16 : 28);

  return (
    <View
      className={cn('flex-1 bg-background dark:bg-background-dark', className)}
      style={{ flex: 1 }}
    >
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={bottomOffset}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled
        contentContainerClassName={cn('px-5', contentContainerClassName)}
        contentContainerStyle={{
          // Long forms: size to children so scroll works.
          // Short screens: grow + center only when keyboard closed.
          flexGrow: useCentering ? 1 : undefined,
          justifyContent: useCentering ? 'center' : undefined,
          paddingTop: topPad,
          paddingBottom: bottomPad,
        }}
        {...scrollViewProps}
      >
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}
