import { Platform } from 'react-native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

/** Shared horizontal slide — auth, app modules, nested stacks */
export const slideTransitionOptions: NativeStackNavigationOptions = {
  animation: 'slide_from_right',
  gestureEnabled: true,
  fullScreenGestureEnabled: Platform.OS === 'ios',
};

/** Auth stack — headerless onboarding / login flow */
export const authStackScreenOptions: NativeStackNavigationOptions = {
  ...slideTransitionOptions,
  headerShown: false,
  contentStyle: { flex: 1, backgroundColor: '#F8FAFC' },
};

/** Logged-in root stack */
export const appRootStackScreenOptions: NativeStackNavigationOptions = {
  ...slideTransitionOptions,
  headerShown: true,
  headerStyle: { backgroundColor: '#FFFFFF' },
  headerTitleStyle: { fontWeight: '600', color: '#0F172A' },
  headerTintColor: '#059669',
  contentStyle: { flex: 1, backgroundColor: '#F8FAFC' },
};

/** Feature module stacks (customers, products, etc.) */
export const moduleStackScreenOptions: NativeStackNavigationOptions = {
  ...slideTransitionOptions,
  headerTintColor: '#059669',
  headerTitleStyle: { fontWeight: '600', color: '#0F172A' },
  headerStyle: { backgroundColor: '#FFFFFF' },
  contentStyle: { flex: 1, backgroundColor: '#F8FAFC' },
};

/** Simple module stacks with header only */
export const moduleStackScreenOptionsMinimal: NativeStackNavigationOptions = {
  ...slideTransitionOptions,
  headerShown: true,
  headerTintColor: '#059669',
};
