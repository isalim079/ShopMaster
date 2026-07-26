import { useEffect, useState } from 'react';
import { Appearance, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useAppSelector } from '@/src/store/hooks';
import { cn } from './cn';

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const preference = useAppSelector((s) => s.theme.preference);
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
  );

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
