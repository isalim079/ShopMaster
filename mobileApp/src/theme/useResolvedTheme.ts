import { useMemo } from 'react';
import { Appearance } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

import { useAppSelector } from '@/src/store/hooks';
import { colors } from '@/src/theme/tokens';

export type ResolvedTheme = 'light' | 'dark';

/**
 * Resolved app theme for navigation chrome + imperative styles.
 * Body `dark:` classes come from NativeWind setColorScheme in ThemeProvider.
 */
export function useResolvedTheme(): {
  preference: 'light' | 'dark' | 'system';
  resolved: ResolvedTheme;
  isDark: boolean;
  palette: (typeof colors)['light'] | (typeof colors)['dark'];
} {
  const preference = useAppSelector((s) => s.theme.preference);
  const { colorScheme } = useNativeWindColorScheme();

  return useMemo(() => {
    const system: ResolvedTheme =
      (colorScheme ?? Appearance.getColorScheme()) === 'dark'
        ? 'dark'
        : 'light';
    const resolved: ResolvedTheme =
      preference === 'system' ? system : preference;
    const isDark = resolved === 'dark';
    return {
      preference,
      resolved,
      isDark,
      palette: isDark ? colors.dark : colors.light,
    };
  }, [preference, colorScheme]);
}
