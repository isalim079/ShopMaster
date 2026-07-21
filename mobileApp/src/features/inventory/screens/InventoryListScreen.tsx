import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';

import { useGetInventoryStocksQuery } from '@/src/features/inventory/api/inventoryApi';
import type { InventoryStock } from '@/src/features/inventory/types';
import { useGetWarehousesQuery } from '@/src/features/warehouse';
import {
  AppText,
  Button,
  Card,
  ChipSelect,
  EmptyState,
  ErrorState,
  LoadingState,
  SearchField,
} from '@/src/shared/components/ui';

export function InventoryListScreen() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState<string | undefined>();
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const { data: warehouses } = useGetWarehousesQuery({ page: 1, limit: 50 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const queryArgs = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      warehouseId,
      lowStock: lowStock ? 'true' : undefined,
    }),
    [page, debouncedSearch, warehouseId, lowStock],
  );

  const { data, isLoading, isFetching, isError, refetch, error } =
    useGetInventoryStocksQuery(queryArgs);

  if (isLoading && page === 1) {
    return <LoadingState message="Loading inventory…" />;
  }

  if (isError && !data) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState
          message={
            (error as { data?: { message?: string } })?.data?.message ??
            'Failed to load inventory'
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
        <View className="flex-row items-center justify-between gap-2">
          <AppText variant="title">Inventory</AppText>
          <View className="flex-row gap-2">
            <Button
              label="History"
              size="sm"
              variant="outline"
              onPress={() => router.push('/(app)/inventory/history')}
            />
            <Button
              label="Adjust"
              size="sm"
              onPress={() => router.push('/(app)/inventory/adjust')}
            />
          </View>
        </View>
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search products"
        />
        <ChipSelect
          label="Warehouse"
          allowClear
          value={warehouseId}
          onChange={(value) => {
            setWarehouseId(value || undefined);
            setPage(1);
          }}
          options={(warehouses?.items ?? []).map((w) => ({
            label: w.name,
            value: w.id,
          }))}
        />
        <ChipSelect
          options={[
            { label: 'All stock', value: 'all' },
            { label: 'Low stock', value: 'low' },
          ]}
          value={lowStock ? 'low' : 'all'}
          onChange={(value) => {
            setLowStock(value === 'low');
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
            title="No stock rows"
            description="Products with warehouse stock will appear here."
          />
        }
        renderItem={({ item }) => <StockRow stock={item} />}
      />
    </View>
  );
}

function StockRow({ stock }: { stock: InventoryStock }) {
  const isLow =
    stock.reorderLevel != null && stock.quantity <= stock.reorderLevel;

  return (
    <Pressable
      className="mb-3"
      onPress={() =>
        router.push({
          pathname: '/(app)/inventory/adjust',
          params: {
            productId: stock.productId,
            warehouseId: stock.warehouseId,
          },
        })
      }
    >
      <Card className="gap-1">
        <View className="flex-row justify-between gap-2">
          <AppText variant="title" className="flex-1">
            {stock.productName}
          </AppText>
          <AppText
            variant="title"
            className={isLow ? 'text-danger' : undefined}
          >
            {stock.quantity}
          </AppText>
        </View>
        <AppText variant="caption">
          {stock.warehouseName}
          {stock.productSku ? ` · ${stock.productSku}` : ''}
        </AppText>
        {isLow ? (
          <AppText variant="caption" className="text-danger">
            Below reorder level ({stock.reorderLevel})
          </AppText>
        ) : null}
      </Card>
    </Pressable>
  );
}
