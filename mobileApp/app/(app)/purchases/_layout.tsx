import { Stack } from 'expo-router';

import { moduleStackScreenOptionsMinimal } from '@/src/navigation/stackOptions';

export default function PurchasesLayout() {
  return (
    <Stack screenOptions={moduleStackScreenOptionsMinimal}>
      <Stack.Screen name="index" options={{ title: 'Purchases' }} />
      <Stack.Screen name="create" options={{ title: 'New purchase' }} />
      <Stack.Screen name="[id]" options={{ title: 'Purchase' }} />
      <Stack.Screen name="[id]/receive" options={{ title: 'Receive' }} />
    </Stack>
  );
}
