import '../global.css';

import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useAuthBootstrap } from '@/src/features/auth/hooks/useAuthBootstrap';
import { slideTransitionOptions } from '@/src/navigation/stackOptions';
import { store } from '@/src/store';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { LoadingState } from '@/src/shared/components/ui/ScreenStates';
import { AppModalProvider } from '@/src/shared/components/ui/AppModal';
import { ToastProvider } from '@/src/shared/components/ui/Toast';
import { useAppSelector } from '@/src/store/hooks';

export { ErrorBoundary } from 'expo-router';

// Keep splash only briefly — never block forever if Metro/JS slow
void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function hideSplash() {
  void SplashScreen.hideAsync().catch(() => undefined);
}

function BootstrapGate({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  const isHydrated = useAppSelector((s) => s.auth.isHydrated);

  useEffect(() => {
    // Hide as soon as React mounts — do not wait on auth
    hideSplash();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      hideSplash();
    }
  }, [isHydrated]);

  useEffect(() => {
    const timer = setTimeout(hideSplash, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isHydrated) {
    return <LoadingState message="Starting ShopMaster…" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <ThemeProvider>
            <ToastProvider>
              <AppModalProvider>
                <View style={{ flex: 1 }}>
                  <BootstrapGate>
                    <Stack
                      screenOptions={{
                        ...slideTransitionOptions,
                        headerShown: false,
                      }}
                    >
                      <Stack.Screen name="index" />
                      <Stack.Screen name="(auth)" />
                      <Stack.Screen name="(app)" />
                      <Stack.Screen name="+not-found" />
                    </Stack>
                  </BootstrapGate>
                </View>
              </AppModalProvider>
            </ToastProvider>
          </ThemeProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
