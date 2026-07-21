import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';

import { useGetSalesQuery } from '@/src/features/sales/api/salesApi';
import type { Sale } from '@/src/features/sales/types';
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
import { formatDate, formatMoney } from '@/src/shared/lib/format';
import type { DocumentStatus } from '@/src/shared/types/enums';

export function SaleListScreen() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState<DocumentStatus | undefined>();
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const args = useMemo(
    () => ({
      page,
      limit: 20,
      search: debounced || undefined,
      status,
    }),
    [page, debounced, status],
  );

  const { data, isLoading, isFetching, isError, refetch, error } =
    useGetSalesQuery(args);

  if (isLoading && page === 1) {
    return <LoadingState message="Loading sales…" />;
  }

  if (isError && !data) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState
          message={
            (error as { data?: { message?: string } })?.data?.message ??
            'Failed to load sales'
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
          <AppText variant="title">Sales</AppText>
          <Button
            label="New"
            size="sm"
            onPress={() => router.push('/(app)/sales/create')}
          />
        </View>
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search sales"
        />
        <ChipSelect
          allowClear
          value={status}
          onChange={(value) => {
            setStatus(value ? (value as DocumentStatus) : undefined);
            setPage(1);
          }}
          options={[
            { label: 'Draft', value: 'DRAFT' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Cancelled', value: 'CANCELLED' },
          ]}
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
            title="No sales"
            description="Create a sale to record revenue."
          />
        }
        renderItem={({ item }) => <SaleRow sale={item} />}
      />
    </View>
  );
}

function SaleRow({ sale }: { sale: Sale }) {
  return (
    <Pressable
      className="mb-3"
      onPress={() => router.push(`/(app)/sales/${sale.id}`)}
    >
      <Card className="gap-1">
        <View className="flex-row justify-between">
          <AppText variant="title">{sale.number}</AppText>
          <AppText variant="caption">{sale.status}</AppText>
        </View>
        <AppText variant="caption">
          {sale.customerName ?? 'Walk-in'} · {formatDate(sale.saleDate)}
        </AppText>
        <View className="flex-row justify-between">
          <AppText variant="body">{formatMoney(sale.total)}</AppText>
          <AppText variant="caption">{sale.paymentStatus}</AppText>
        </View>
      </Card>
    </Pressable>
  );
}
