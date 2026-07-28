import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/src/theme/cn';

type FormKeyboardScrollContextValue = {
  scrollRef: RefObject<ScrollView | null>;
  scrollY: RefObject<number>;
  keyboardHeight: number;
};

const FormKeyboardScrollContext =
  createContext<FormKeyboardScrollContextValue | null>(null);

export function useFormKeyboardScroll() {
  return useContext(FormKeyboardScrollContext);
}

type KeyboardAwareScrollScreenProps = {
  children: ReactNode;
  className?: string;
  contentContainerClassName?: string;
  /** Center short screens only (login). Never use on long forms. */
  centerContent?: boolean;
  scrollViewProps?: Omit<
    ScrollViewProps,
    'children' | 'contentContainerStyle' | 'style'
  >;
};

export function KeyboardAwareScrollScreen({
  children,
  className,
  contentContainerClassName,
  centerContent = false,
  scrollViewProps,
}: KeyboardAwareScrollScreenProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const keyboardOpen = keyboardHeight > 0;
  const useCentering = centerContent && !keyboardOpen;
  const topPad = Math.max(insets.top, 16);
  const bottomPad =
    Math.max(insets.bottom, 16) +
    (keyboardOpen
      ? Platform.OS === 'android'
        ? keyboardHeight + 32
        : 32
      : 28);

  const scrollContextValue: FormKeyboardScrollContextValue = {
    scrollRef,
    scrollY,
    keyboardHeight,
  };

  const scrollView = (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="none"
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      decelerationRate="normal"
      overScrollMode="always"
      onScroll={(event) => {
        scrollY.current = event.nativeEvent.contentOffset.y;
        scrollViewProps?.onScroll?.(event);
      }}
      scrollEventThrottle={16}
      contentContainerClassName={cn('px-5', contentContainerClassName)}
      contentContainerStyle={{
        flexGrow: useCentering ? 1 : undefined,
        justifyContent: useCentering ? 'center' : undefined,
        paddingTop: topPad,
        paddingBottom: bottomPad,
      }}
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  );

  return (
    <FormKeyboardScrollContext.Provider value={scrollContextValue}>
      <View
        style={{ flex: 1 }}
        className={cn('bg-background dark:bg-background-dark', className)}
      >
        {Platform.OS === 'ios' ? (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            {scrollView}
          </KeyboardAvoidingView>
        ) : (
          scrollView
        )}
      </View>
    </FormKeyboardScrollContext.Provider>
  );
}
