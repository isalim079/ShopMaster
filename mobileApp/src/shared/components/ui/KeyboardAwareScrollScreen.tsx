import { useEffect, useState, type ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/src/theme/cn';

type KeyboardAwareScrollScreenProps = {
  children: ReactNode;
  className?: string;
  contentContainerClassName?: string;
  /** Extra offset above keyboard (e.g. custom header height). */
  keyboardVerticalOffset?: number;
  /** Vertically center short content (login). Long forms should leave false. */
  centerContent?: boolean;
  scrollViewProps?: Omit<
    ScrollViewProps,
    'children' | 'contentContainerClassName' | 'contentContainerStyle'
  >;
};

/**
 * Production keyboard + scroll shell:
 * - iOS: KAV padding + ScrollView `automaticallyAdjustKeyboardInsets`
 * - Android: `softwareKeyboardLayoutMode: resize` + safe-area bottom pad
 * - Interactive / on-drag keyboard dismiss
 */
export function KeyboardAwareScrollScreen({
  children,
  className,
  contentContainerClassName,
  keyboardVerticalOffset = 0,
  centerContent = false,
  scrollViewProps,
}: KeyboardAwareScrollScreenProps) {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const topPad = Math.max(insets.top, 16);
  const bottomPad = Math.max(insets.bottom, 16) + (keyboardVisible ? 12 : 24);

  return (
    <KeyboardAvoidingView
      className={cn('flex-1 bg-background dark:bg-background-dark', className)}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        alwaysBounceVertical={false}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        automaticallyAdjustsScrollIndicatorInsets
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName={cn(
          'flex-grow px-5',
          centerContent && !keyboardVisible && 'justify-center',
          contentContainerClassName,
        )}
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: bottomPad,
        }}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
