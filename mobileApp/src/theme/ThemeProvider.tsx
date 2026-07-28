import { useEffect, useState } from 'react';
import { Appearance, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { setPreference } from '@/src/store/themeSlice';
import {
  loadThemePreference,
  saveThemePreference,
} from '@/src/theme/themeStorage';
import { colors } from '@/src/theme/tokens';

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const dispatch = useAppDispatch();
  const preference = useAppSelector((s) => s.theme.preference);
  const { setColorScheme } = useNativeWindColorScheme();
  const [ready, setReady] = useState(false);
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
  );

  // Hydrate theme from AsyncStorage on boot
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const saved = await loadThemePreference();
      if (!cancelled && saved) {
        dispatch(setPreference(saved));
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  // Persist after hydrate — avoid overwriting saved theme with default
  useEffect(() => {
    if (!ready) return;
    void saveThemePreference(preference);
  }, [preference, ready]);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => sub.remove();
  }, []);

  const resolved =
    preference === 'system' ? systemScheme : preference;
  const isDark = resolved === 'dark';
  const palette = isDark ? colors.dark : colors.light;

  // NativeWind dark: variants follow global color scheme — not parent className
  useEffect(() => {
    setColorScheme(preference === 'system' ? 'system' : preference);
    if (preference === 'light' || preference === 'dark') {
      Appearance.setColorScheme(preference);
    } else {
      Appearance.setColorScheme(null);
    }
  }, [preference, setColorScheme]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </View>
  );
}
