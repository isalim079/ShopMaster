import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/src/shared/components/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found', headerShown: true }} />
      <View className="flex-1 items-center justify-center gap-3 bg-background px-4 dark:bg-background-dark">
        <AppText variant="headline">Screen not found</AppText>
        <Link href="/">
          <AppText className="text-primary">Go home</AppText>
        </Link>
      </View>
    </>
  );
}
