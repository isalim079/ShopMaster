import { Platform } from 'react-native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { colors } from '@/src/theme/tokens';

/** Shared horizontal slide — auth, app modules, nested stacks */
export const slideTransitionOptions: NativeStackNavigationOptions = {
  animation: 'slide_from_right',
  gestureEnabled: true,
  fullScreenGestureEnabled: Platform.OS === 'ios',
};

function chrome(isDark: boolean) {
  const palette = isDark ? colors.dark : colors.light;
  return {
    headerStyle: { backgroundColor: palette.surface },
    headerTitleStyle: {
      fontWeight: '600' as const,
      color: palette.foreground,
    },
    headerTintColor: colors.brand.primary,
    contentStyle: { flex: 1, backgroundColor: palette.background },
  };
}

/** Auth stack — headerless onboarding / login flow */
export function authStackScreenOptions(
  isDark: boolean,
): NativeStackNavigationOptions {
  return {
    ...slideTransitionOptions,
    headerShown: false,
    contentStyle: {
      flex: 1,
      backgroundColor: isDark ? colors.dark.background : colors.light.background,
    },
  };
}

/** Logged-in root stack */
export function appRootStackScreenOptions(
  isDark: boolean,
): NativeStackNavigationOptions {
  return {
    ...slideTransitionOptions,
    headerShown: true,
    ...chrome(isDark),
  };
}

/** Feature module stacks (customers, products, etc.) */
export function moduleStackScreenOptions(
  isDark: boolean,
): NativeStackNavigationOptions {
  return {
    ...slideTransitionOptions,
    ...chrome(isDark),
  };
}

/** Simple module stacks with header only */
export function moduleStackScreenOptionsMinimal(
  isDark: boolean,
): NativeStackNavigationOptions {
  return {
    ...slideTransitionOptions,
    headerShown: true,
    headerTintColor: colors.brand.primary,
    headerStyle: {
      backgroundColor: isDark ? colors.dark.surface : colors.light.surface,
    },
    headerTitleStyle: {
      fontWeight: '600',
      color: isDark ? colors.dark.foreground : colors.light.foreground,
    },
    contentStyle: {
      flex: 1,
      backgroundColor: isDark ? colors.dark.background : colors.light.background,
    },
  };
}
