import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';

import { useGetProductsQuery } from '@/src/features/products/api/productsApi';
import type { Product } from '@/src/features/products/types';
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
import { formatMoney } from '@/src/shared/lib/format';
import type { CatalogStatus } from '@/src/shared/types/enums';

export function ProductListScreen() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<CatalogStatus | undefined>();
  const [page, setPage] = useState(1);

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
      status,
    }),
    [page, debouncedSearch, status],
  );

  const { data, isLoading, isFetching, isError, refetch, error } =
    useGetProductsQuery(queryArgs);

  const onEndReached = () => {
    if (isFetching) return;
    const totalPages = data?.meta.totalPages ?? 1;
    if (page < totalPages) setPage((p) => p + 1);
  };

  if (isLoading && page === 1) {
    return <LoadingState message="Loading products…" />;
  }

  if (isError && !data) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState
          message={
            (error as { data?: { message?: string } })?.data?.message ??
            'Failed to load products'
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
        <View className="flex-row items-center justify-between gap-3">
          <AppText variant="title">Products</AppText>
          <Button
            label="Add"
            size="sm"
            onPress={() => router.push('/(app)/products/create')}
          />
        </View>
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, SKU, barcode"
        />
        <ChipSelect
          options={[
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Inactive', value: 'INACTIVE' },
          ]}
          value={status}
          allowClear
          onChange={(value) => {
            setStatus(value ? (value as CatalogStatus) : undefined);
            setPage(1);
          }}
        />
      </View>

      <FlashList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        refreshing={isFetching && page === 1}
        onRefresh={() => {
          setPage(1);
          refetch();
        }}
        ListEmptyComponent={
          <EmptyState
            title="No products"
            description="Create your first product to start selling."
          />
        }
        renderItem={({ item }) => <ProductRow product={item} />}
      />
    </View>
  );
}

function ProductRow({ product }: { product: Product }) {
  return (
    <Pressable
      onPress={() => router.push(`/(app)/products/${product.id}`)}
      className="mb-3"
    >
      <Card className="gap-1">
        <View className="flex-row items-start justify-between gap-2">
          <AppText variant="title" className="flex-1">
            {product.name}
          </AppText>
          <AppText variant="caption">{product.status}</AppText>
        </View>
        <AppText variant="caption">
          {[product.sku, product.barcode].filter(Boolean).join(' · ') || 'No SKU'}
        </AppText>
        <View className="mt-1 flex-row justify-between">
          <AppText variant="body">Buy {formatMoney(product.purchasePrice)}</AppText>
          <AppText variant="body">Sell {formatMoney(product.salePrice)}</AppText>
        </View>
      </Card>
    </Pressable>
  );
}
