import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { useGetInventoryReportQuery } from '@/src/features/reports/api/reportsApi';
import type { InventoryReportRow } from '@/src/features/reports/types';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  SearchField,
} from '@/src/shared/components/ui';
import { formatCurrency } from '@/src/shared/utils/format';
import { useDebouncedValue } from '@/src/shared/hooks/useDebouncedValue';

export function InventoryReportScreen() {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search.trim(), 300);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [debounced]);

  const args = useMemo(
    () => ({
      page,
      limit: 20,
      search: debounced || undefined,
    }),
    [page, debounced],
  );
  const { data, isLoading, isFetching, isError, refetch, error } =
    useGetInventoryReportQuery(args);

  const totalValue = (data?.items ?? []).reduce(
    (sum, row) => sum + row.value,
    0,
  );

  if (isLoading && page === 1) {
    return <LoadingState message="Loading inventory report…" />;
  }

  if (isError && !data) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState
          message={
            (error as { data?: { message?: string } })?.data?.message ??
            'Failed to load report'
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
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search products"
        />
        <Card className="flex-row justify-between">
          <AppText variant="caption">Page stock value</AppText>
          <AppText variant="title">{formatCurrency(totalValue)}</AppText>
        </Card>
      </View>
      <FlashList
        data={data?.items ?? []}
        keyExtractor={(item) => `${item.productId}:${item.warehouseId}`}
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
            title="No stock"
            description="No inventory rows match this search."
          />
        }
        renderItem={({ item }) => <InventoryRow row={item} />}
      />
    </View>
  );
}

function InventoryRow({ row }: { row: InventoryReportRow }) {
  return (
    <Card className="mb-3 gap-1">
      <View className="flex-row justify-between">
        <AppText variant="title" className="flex-1 pr-2">
          {row.productName}
        </AppText>
        <AppText variant="title">{formatCurrency(row.value)}</AppText>
      </View>
      <AppText variant="caption">
        SKU {row.sku} · {row.warehouseName}
      </AppText>
      <AppText variant="caption">
        Qty {row.quantity} · unit {formatCurrency(row.unitCost)}
      </AppText>
    </Card>
  );
}
