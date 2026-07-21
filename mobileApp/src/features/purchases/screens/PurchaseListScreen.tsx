import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';

import { useGetPurchasesQuery } from '@/src/features/purchases/api/purchasesApi';
import type { Purchase } from '@/src/features/purchases/types';
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

export function PurchaseListScreen() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const queryArgs = useMemo(
    () => ({ page, limit: 20, search: debouncedSearch || undefined }),
    [page, debouncedSearch],
  );
  const { data, isLoading, isFetching, isError, refetch, error } =
    useGetPurchasesQuery(queryArgs);

  if (isLoading && page === 1) return <LoadingState message="Loading purchases…" />;
  if (isError && !data) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState message={(error as { data?: { message?: string } })?.data?.message ?? 'Failed to load'} />
        <View className="px-4 pb-6"><Button label="Retry" onPress={() => refetch()} /></View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <View className="gap-3 px-4 pt-4">
        <View className="flex-row items-center justify-between">
          <AppText variant="title">Purchases</AppText>
          <Button label="New" size="sm" onPress={() => router.push('/(app)/purchases/create')} />
        </View>
        <SearchField value={search} onChangeText={setSearch} placeholder="Search purchases" />
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
        onRefresh={() => { setPage(1); refetch(); }}
        ListEmptyComponent={<EmptyState title="No purchases" description="Create a purchase order to restock." />}
        renderItem={({ item }) => <PurchaseRow purchase={item} />}
      />
    </View>
  );
}

function PurchaseRow({ purchase }: { purchase: Purchase }) {
  return (
    <Pressable className="mb-3" onPress={() => router.push(`/(app)/purchases/${purchase.id}`)}>
      <Card className="gap-1">
        <View className="flex-row justify-between">
          <AppText variant="title">{purchase.number}</AppText>
          <AppText variant="caption">{purchase.status}</AppText>
        </View>
        <AppText variant="caption">
          {purchase.supplierName ?? 'Supplier'} · {formatDate(purchase.orderDate)}
        </AppText>
        <AppText variant="body">{formatMoney(purchase.total)}</AppText>
      </Card>
    </Pressable>
  );
}
