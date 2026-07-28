import { Stack } from 'expo-router';

import { moduleStackScreenOptionsMinimal } from '@/src/navigation/stackOptions';
import { useResolvedTheme } from '@/src/theme/useResolvedTheme';

export default function PurchasesLayout() {
  const { isDark } = useResolvedTheme();
  return (
    <Stack screenOptions={moduleStackScreenOptionsMinimal(isDark)}>
      <Stack.Screen name="index" options={{ title: 'Purchases' }} />
      <Stack.Screen name="create" options={{ title: 'New purchase' }} />
      <Stack.Screen name="[id]" options={{ title: 'Purchase' }} />
      <Stack.Screen name="[id]/receive" options={{ title: 'Receive' }} />
    </Stack>
  );
}
