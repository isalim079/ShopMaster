import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import {
  DateRangeFilter,
  defaultDateRange,
} from '@/src/features/reports/components/DateRangeFilter';
import { useGetExpensesReportQuery } from '@/src/features/reports/api/reportsApi';
import type { ExpensesReportRow } from '@/src/features/reports/types';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/src/shared/components/ui';
import { formatCurrency, formatDate } from '@/src/shared/utils/format';

export function ExpensesReportScreen() {
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
    useGetExpensesReportQuery(args);

  const totalAmount = (data?.items ?? []).reduce(
    (sum, row) => sum + row.amount,
    0,
  );

  if (isLoading && page === 1) {
    return <LoadingState message="Loading expenses report…" />;
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
            title="No expenses"
            description="No expenses found for this date range."
          />
        }
        renderItem={({ item }) => <ExpenseRow row={item} />}
      />
    </View>
  );
}

function ExpenseRow({ row }: { row: ExpensesReportRow }) {
  return (
    <Card className="mb-3 gap-1">
      <View className="flex-row justify-between">
        <AppText variant="title" className="flex-1 pr-2">
          {row.title}
        </AppText>
        <AppText variant="title">{formatCurrency(row.amount)}</AppText>
      </View>
      <AppText variant="caption">
        {row.categoryName ?? 'Uncategorized'} · {formatDate(row.expenseDate)}
      </AppText>
      <AppText variant="caption">{row.paymentMethod}</AppText>
    </Card>
  );
}
