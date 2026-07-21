import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import {
  DateRangeFilter,
  defaultDateRange,
} from '@/src/features/reports/components/DateRangeFilter';
import { useGetProfitLossReportQuery } from '@/src/features/reports/api/reportsApi';
import {
  AppText,
  Button,
  Card,
  ErrorState,
  LoadingState,
} from '@/src/shared/components/ui';
import { formatCurrency } from '@/src/shared/utils/format';

export function ProfitLossReportScreen() {
  const defaults = defaultDateRange();
  const [fromDraft, setFromDraft] = useState(defaults.from);
  const [toDraft, setToDraft] = useState(defaults.to);
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);

  const args = useMemo(() => ({ from, to }), [from, to]);
  const { data, isLoading, isFetching, isError, refetch, error } =
    useGetProfitLossReportQuery(args);

  if (isLoading && !data) {
    return <LoadingState message="Loading profit & loss…" />;
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

  const rows = [
    { label: 'Revenue', value: data?.revenue ?? 0 },
    { label: 'Purchases', value: data?.purchases ?? 0 },
    { label: 'Gross profit', value: data?.grossProfit ?? 0 },
    { label: 'Expenses', value: data?.expenses ?? 0 },
    { label: 'Net profit', value: data?.netProfit ?? 0 },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-background-dark"
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
      }
      contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
    >
      <DateRangeFilter
        from={fromDraft}
        to={toDraft}
        onChangeFrom={setFromDraft}
        onChangeTo={setToDraft}
        loading={isFetching}
        onApply={() => {
          setFrom(fromDraft);
          setTo(toDraft);
        }}
      />

      <Card className="gap-3">
        <AppText variant="title">Profit & loss</AppText>
        <AppText variant="caption">
          {data?.from ? `${data.from} → ${data.to}` : `${from} → ${to}`}
        </AppText>
        {rows.map((row) => (
          <View
            key={row.label}
            className="flex-row items-center justify-between border-b border-border py-2 dark:border-border-dark"
          >
            <AppText variant="body">{row.label}</AppText>
            <AppText variant="title">{formatCurrency(row.value)}</AppText>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}
