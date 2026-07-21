import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

import { useAppSelector } from '@/src/store/hooks';
import { cn } from './cn';

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const preference = useAppSelector((s) => s.theme.preference);
  const systemScheme = useColorScheme();
  const resolved =
    preference === 'system' ? (systemScheme ?? 'light') : preference;
  const isDark = resolved === 'dark';

  return (
    <View className={cn('flex-1 bg-background', isDark && 'dark')}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </View>
  );
}
