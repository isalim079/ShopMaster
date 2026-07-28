import { useEffect, useState } from 'react';
import { Appearance, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { setPreference } from '@/src/store/themeSlice';
import {
  loadThemePreference,
  saveThemePreference,
} from '@/src/theme/themeStorage';
import { cn } from './cn';

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const dispatch = useAppDispatch();
  const preference = useAppSelector((s) => s.theme.preference);
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

  return (
    <View className={cn('flex-1 bg-background', isDark && 'dark')}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </View>
  );
}
