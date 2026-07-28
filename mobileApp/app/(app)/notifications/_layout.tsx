import { Stack } from 'expo-router';

import { moduleStackScreenOptions } from '@/src/navigation/stackOptions';

export default function NotificationsLayout() {
  return (
    <Stack screenOptions={moduleStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Notifications' }} />
    </Stack>
  );
}
