import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/src/shared/components/ui';

type ScreenStateProps = {
  message?: string;
};

export function LoadingState({ message = 'Loading…' }: ScreenStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background px-4 dark:bg-background-dark">
      <ActivityIndicator size="large" color="#059669" />
      <AppText variant="caption">{message}</AppText>
    </View>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-2 px-8 py-12">
      <AppText variant="title" className="text-center">
        {title}
      </AppText>
      {description ? (
        <AppText variant="caption" className="text-center">
          {description}
        </AppText>
      ) : null}
    </View>
  );
}

export function ErrorState({
  message = 'Something went wrong',
}: ScreenStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-2 px-8 py-12">
      <AppText variant="title" className="text-center text-danger">
        {message}
      </AppText>
    </View>
  );
}
