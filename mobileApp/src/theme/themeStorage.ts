import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ThemePreference } from '@/src/store/themeSlice';

const THEME_KEY = 'shopmaster.theme.preference';

export async function loadThemePreference(): Promise<ThemePreference | null> {
  try {
    const value = await AsyncStorage.getItem(THEME_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveThemePreference(
  preference: ThemePreference,
): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_KEY, preference);
  } catch {
    // Ignore persistence failures — Redux still holds live value
  }
}
