import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import {
  DateRangeFilter,
  defaultDateRange,
} from '@/src/features/reports/components/DateRangeFilter';
import { useGetPurchasesReportQuery } from '@/src/features/reports/api/reportsApi';
import type { PurchasesReportRow } from '@/src/features/reports/types';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/src/shared/components/ui';
import { formatCurrency, formatDate } from '@/src/shared/utils/format';

export function PurchasesReportScreen() {
  const defaults = defaultDateRange();
  const [fromDraft, setFromDraft] = useState(defaults.from);
  const [toDraft, setToDraft] = useState(defaults.to);
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [page, setPage] = useState(1);

  const args = useMemo(
    () => ({ page, limit: 20, from, to }),
    [page, from, to],
  );
  const { data, isLoading, isFetching, isError, refetch, error } =
    useGetPurchasesReportQuery(args);

  const totalAmount = (data?.items ?? []).reduce(
    (sum, row) => sum + row.total,
    0,
  );

  if (isLoading && page === 1) {
    return <LoadingState message="Loading purchases report…" />;
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
        <DateRangeFilter
          from={fromDraft}
          to={toDraft}
          onChangeFrom={setFromDraft}
          onChangeTo={setToDraft}
          loading={isFetching}
          onApply={() => {
            setFrom(fromDraft);
            setTo(toDraft);
            setPage(1);
          }}
        />
        <Card className="flex-row justify-between">
          <AppText variant="caption">Page total</AppText>
          <AppText variant="title">{formatCurrency(totalAmount)}</AppText>
        </Card>
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
            title="No purchases"
            description="No purchases found for this date range."
          />
        }
        renderItem={({ item }) => <PurchaseRow row={item} />}
      />
    </View>
  );
}

function PurchaseRow({ row }: { row: PurchasesReportRow }) {
  return (
    <Card className="mb-3 gap-1">
      <View className="flex-row justify-between">
        <AppText variant="title">{row.number}</AppText>
        <AppText variant="title">{formatCurrency(row.total)}</AppText>
      </View>
      <AppText variant="caption">
        {row.supplierName ?? 'Supplier'} · {formatDate(row.orderDate)}
      </AppText>
      <AppText variant="caption">
        {row.status} · {row.paymentStatus} · paid{' '}
        {formatCurrency(row.paidAmount)}
      </AppText>
    </Card>
  );
}
