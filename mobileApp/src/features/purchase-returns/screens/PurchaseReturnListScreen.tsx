import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';

import { useGetPurchaseReturnsQuery } from '@/src/features/purchase-returns/api/purchaseReturnsApi';
import type { PurchaseReturn } from '@/src/features/purchase-returns/types';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  SearchField,
} from '@/src/shared/components/ui';
import { formatDate, formatMoney } from '@/src/shared/lib/format';

export function PurchaseReturnListScreen() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const args = useMemo(
    () => ({ page, limit: 20, search: debounced || undefined }),
    [page, debounced],
  );
  const { data, isLoading, isFetching, isError, refetch, error } =
    useGetPurchaseReturnsQuery(args);

  if (isLoading && page === 1) {
    return <LoadingState message="Loading returns…" />;
  }

  if (isError && !data) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState
          message={
            (error as { data?: { message?: string } })?.data?.message ??
            'Failed to load'
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
      <View className="gap-3 px-4 pt-4">
        <View className="flex-row items-center justify-between">
          <AppText variant="title">Purchase returns</AppText>
          <Button
            label="New"
            size="sm"
            onPress={() => router.push('/(app)/purchase-returns/create')}
          />
        </View>
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search returns"
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
            title="No returns"
            description="Return purchased goods from here."
          />
        }
        renderItem={({ item }) => <ReturnRow item={item} />}
      />
    </View>
  );
}

function ReturnRow({ item }: { item: PurchaseReturn }) {
  return (
    <Pressable
      className="mb-3"
      onPress={() => router.push(`/(app)/purchase-returns/${item.id}`)}
    >
      <Card className="gap-1">
        <View className="flex-row justify-between">
          <AppText variant="title">{item.number}</AppText>
          <AppText variant="caption">{item.status}</AppText>
        </View>
        <AppText variant="caption">
          {item.purchaseNumber ?? item.purchaseId} · {formatDate(item.returnDate)}
        </AppText>
        <AppText variant="body">{formatMoney(item.total)}</AppText>
      </Card>
    </Pressable>
  );
}
