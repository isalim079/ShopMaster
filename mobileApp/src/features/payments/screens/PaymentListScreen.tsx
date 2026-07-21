import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';

import { useGetPaymentsQuery } from '@/src/features/payments/api/paymentsApi';
import type { Payment } from '@/src/features/payments/types';
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
import type { PaymentDirection } from '@/src/shared/types/enums';

export function PaymentListScreen() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [direction, setDirection] = useState<PaymentDirection | undefined>();
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
      direction,
    }),
    [page, debounced, direction],
  );

  const { data, isLoading, isFetching, isError, refetch, error } =
    useGetPaymentsQuery(args);

  if (isLoading && page === 1) {
    return <LoadingState message="Loading payments…" />;
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
          <AppText variant="title">Payments</AppText>
          <Button
            label="New"
            size="sm"
            onPress={() => router.push('/(app)/payments/create')}
          />
        </View>
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search payments"
        />
        <ChipSelect
          allowClear
          value={direction}
          onChange={(value) => {
            setDirection(value ? (value as PaymentDirection) : undefined);
            setPage(1);
          }}
          options={[
            { label: 'In', value: 'IN' },
            { label: 'Out', value: 'OUT' },
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
            title="No payments"
            description="Record money in and out against sales or purchases."
          />
        }
        renderItem={({ item }) => <PaymentRow payment={item} />}
      />
    </View>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
  return (
    <Card className="mb-3 gap-1">
      <View className="flex-row justify-between">
        <AppText variant="title">{payment.direction}</AppText>
        <AppText
          variant="title"
          className={payment.direction === 'IN' ? 'text-primary' : 'text-danger'}
        >
          {formatMoney(payment.amount)}
        </AppText>
      </View>
      <AppText variant="caption">
        {payment.method} · {formatDate(payment.paymentDate)}
      </AppText>
      <AppText variant="caption">
        {payment.saleNumber ||
          payment.purchaseNumber ||
          payment.customerName ||
          payment.supplierName ||
          'Linked document'}
      </AppText>
      {payment.notes ? (
        <AppText variant="caption">{payment.notes}</AppText>
      ) : null}
    </Card>
  );
}
