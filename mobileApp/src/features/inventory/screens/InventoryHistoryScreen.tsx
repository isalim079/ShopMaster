import { useState } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { useGetInventoryHistoryQuery } from '@/src/features/inventory/api/inventoryApi';
import type { InventoryMovement } from '@/src/features/inventory/types';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/src/shared/components/ui';
import { formatDate } from '@/src/shared/lib/format';

export function InventoryHistoryScreen() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch, error } =
    useGetInventoryHistoryQuery({ page, limit: 20 });

  if (isLoading && page === 1) {
    return <LoadingState message="Loading history…" />;
  }

  if (isError && !data) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState
          message={
            (error as { data?: { message?: string } })?.data?.message ??
            'Failed to load history'
          }
        />
        <View className="px-4 pb-6">
          <Button label="Retry" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <View className="px-4 pt-4">
        <AppText variant="title">Stock movements</AppText>
      </View>
      <FlashList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        onEndReached={() => {
          if (isFetching) return;
          const totalPages = data?.meta.totalPages ?? 1;
          if (page < totalPages) setPage((p) => p + 1);
        }}
        onEndReachedThreshold={0.4}
        refreshing={isFetching && page === 1}
        onRefresh={() => {
          setPage(1);
          refetch();
        }}
        ListEmptyComponent={
          <EmptyState
            title="No movements"
            description="Adjustments and document stock changes show up here."
          />
        }
        renderItem={({ item }) => <MovementRow movement={item} />}
      />
    </View>
  );
}

function MovementRow({ movement }: { movement: InventoryMovement }) {
  const signed =
    movement.quantity > 0 ? `+${movement.quantity}` : String(movement.quantity);

  return (
    <Card className="mb-3 gap-1">
      <View className="flex-row justify-between gap-2">
        <AppText variant="title" className="flex-1">
          {movement.productName}
        </AppText>
        <AppText
          variant="title"
          className={movement.quantity < 0 ? 'text-danger' : 'text-primary'}
        >
          {signed}
        </AppText>
      </View>
      <AppText variant="caption">
        {movement.type} · {movement.warehouseName}
      </AppText>
      <AppText variant="caption">
        Balance {movement.balanceAfter} · {formatDate(movement.createdAt)}
      </AppText>
      {movement.note ? (
        <AppText variant="caption">{movement.note}</AppText>
      ) : null}
    </Card>
  );
}
