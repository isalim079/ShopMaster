import { useMemo } from 'react';
import { Appearance, useColorScheme } from 'react-native';

import { useAppSelector } from '@/src/store/hooks';
import { colors } from '@/src/theme/tokens';

export type ResolvedTheme = 'light' | 'dark';

export function useResolvedTheme(): {
  preference: 'light' | 'dark' | 'system';
  resolved: ResolvedTheme;
  isDark: boolean;
  palette: (typeof colors)['light'] | (typeof colors)['dark'];
} {
  const preference = useAppSelector((s) => s.theme.preference);
  const systemScheme = useColorScheme();

  return useMemo(() => {
    const system: ResolvedTheme =
      (systemScheme ?? Appearance.getColorScheme()) === 'dark'
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
  }, [preference, systemScheme]);
}
