import {
  Dimensions,
  Keyboard,
  Platform,
  UIManager,
  findNodeHandle,
  type NativeSyntheticEvent,
  type ScrollView,
  type TextInputFocusEventData,
} from 'react-native';
import type { RefObject } from 'react';

type ScrollMetrics = {
  scrollY: number;
  keyboardHeight: number;
};

export function scrollFocusedInputIntoView(
  event: NativeSyntheticEvent<TextInputFocusEventData>,
  scrollRef: RefObject<ScrollView | null>,
  metrics: ScrollMetrics,
) {
  const scrollView = scrollRef.current;
  if (!scrollView) return;

  const target =
    findNodeHandle(event.target) ??
    (typeof event.nativeEvent.target === 'number'
      ? event.nativeEvent.target
      : null);
  if (target == null) return;

  const delay = Platform.OS === 'ios' ? 120 : 280;

  setTimeout(() => {
    UIManager.measureInWindow(
      target,
      (_x, y, _width, height) => {
        const windowHeight = Dimensions.get('window').height;
        const keyboardHeight =
          metrics.keyboardHeight || Keyboard.metrics()?.height || 0;
        const visibleBottom = windowHeight - keyboardHeight - 24;
        const inputBottom = y + height;

        if (inputBottom > visibleBottom) {
          scrollView.scrollTo({
            y: metrics.scrollY + (inputBottom - visibleBottom),
            animated: true,
          });
        }
      },
      () => {},
    );
  }, delay);
}
