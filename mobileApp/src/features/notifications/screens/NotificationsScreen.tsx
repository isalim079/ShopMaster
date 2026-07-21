import { useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/src/features/notifications/api/notificationsApi';
import type { AppNotification } from '@/src/features/notifications/types';
import {
  AppText,
  Button,
  Card,
  ChipSelect,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { formatDate } from '@/src/shared/utils/format';
import { cn } from '@/src/theme/cn';

type ReadFilter = 'all' | 'unread' | 'read';

export function NotificationsScreen() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<ReadFilter>('all');

  const args = useMemo(() => {
    const base: { page: number; limit: number; isRead?: 'true' | 'false' } = {
      page,
      limit: 20,
    };
    if (filter === 'unread') base.isRead = 'false';
    if (filter === 'read') base.isRead = 'true';
    return base;
  }, [page, filter]);

  const { data, isLoading, isFetching, isError, refetch, error } =
    useGetNotificationsQuery(args);
  const [markRead, { isLoading: marking }] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] =
    useMarkAllNotificationsReadMutation();
  const [remove, { isLoading: deleting }] = useDeleteNotificationMutation();

  if (isLoading && page === 1) {
    return <LoadingState message="Loading notifications…" />;
  }

  if (isError && !data) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState message={getErrorMessage(error, 'Failed to load')} />
        <View className="px-4 pb-6">
          <Button label="Retry" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <View className="gap-3 px-4 pt-4">
        <View className="flex-row items-center justify-between gap-2">
          <AppText variant="title">Notifications</AppText>
          <Button
            label="Mark all read"
            size="sm"
            variant="outline"
            loading={markingAll}
            onPress={async () => {
              try {
                await markAllRead().unwrap();
              } catch (err) {
                Alert.alert('Error', getErrorMessage(err));
              }
            }}
          />
        </View>
        <ChipSelect
          options={[
            { label: 'All', value: 'all' },
            { label: 'Unread', value: 'unread' },
            { label: 'Read', value: 'read' },
          ]}
          value={filter}
          onChange={(value) => {
            setFilter(value);
            setPage(1);
          }}
        />
      </View>
      <FlashList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        onEndReached={() => {
          if (isFetching) return;
          if (page < (data?.meta.totalPages ?? 1)) setPage((p) => p + 1);
        }}
        onEndReachedThreshold={0.4}
        refreshing={isFetching && page === 1}
        onRefresh={() => {
          setPage(1);
          refetch();
        }}
        ListEmptyComponent={
          <EmptyState
            title="No notifications"
            description="You're all caught up."
          />
        }
        renderItem={({ item }) => (
          <NotificationRow
            notification={item}
            busy={marking || deleting}
            onMarkRead={async () => {
              try {
                await markRead(item.id).unwrap();
              } catch (err) {
                Alert.alert('Error', getErrorMessage(err));
              }
            }}
            onDelete={() => {
              Alert.alert(
                'Delete notification',
                'Remove this notification?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await remove(item.id).unwrap();
                      } catch (err) {
                        Alert.alert('Error', getErrorMessage(err));
                      }
                    },
                  },
                ],
              );
            }}
          />
        )}
      />
    </View>
  );
}

function NotificationRow({
  notification,
  busy,
  onMarkRead,
  onDelete,
}: {
  notification: AppNotification;
  busy: boolean;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  return (
    <Card
      className={cn(
        'mb-3 gap-2',
        !notification.isRead && 'border border-primary/40',
      )}
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 gap-1">
          <AppText variant="title">{notification.title}</AppText>
          <AppText variant="body">{notification.message}</AppText>
          <AppText variant="caption">
            {notification.type} · {formatDate(notification.createdAt)}
            {!notification.isRead ? ' · Unread' : ''}
          </AppText>
        </View>
      </View>
      <View className="flex-row gap-2">
        {!notification.isRead ? (
          <Pressable disabled={busy} onPress={onMarkRead}>
            <AppText variant="caption" className="text-primary">
              Mark read
            </AppText>
          </Pressable>
        ) : null}
        <Pressable disabled={busy} onPress={onDelete}>
          <AppText variant="caption" className="text-danger">
            Delete
          </AppText>
        </Pressable>
      </View>
    </Card>
  );
}
