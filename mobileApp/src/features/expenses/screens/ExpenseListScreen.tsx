import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';

import { useGetExpensesQuery } from '@/src/features/expenses/api/expensesApi';
import type { Expense } from '@/src/features/expenses/types';
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

export function ExpenseListScreen() {
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
    useGetExpensesQuery(args);

  if (isLoading && page === 1) {
    return <LoadingState message="Loading expenses…" />;
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
        <View className="flex-row items-center justify-between gap-2">
          <AppText variant="title">Expenses</AppText>
          <View className="flex-row gap-2">
            <Button
              label="Categories"
              size="sm"
              variant="outline"
              onPress={() => router.push('/(app)/expenses/categories')}
            />
            <Button
              label="Add"
              size="sm"
              onPress={() => router.push('/(app)/expenses/create')}
            />
          </View>
        </View>
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search expenses"
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
            title="No expenses"
            description="Track shop operating costs here."
          />
        }
        renderItem={({ item }) => <ExpenseRow expense={item} />}
      />
    </View>
  );
}

function ExpenseRow({ expense }: { expense: Expense }) {
  return (
    <Pressable
      className="mb-3"
      onPress={() => router.push(`/(app)/expenses/${expense.id}/edit`)}
    >
      <Card className="gap-1">
        <View className="flex-row justify-between">
          <AppText variant="title" className="flex-1">
            {expense.title}
          </AppText>
          <AppText variant="title">{formatMoney(expense.amount)}</AppText>
        </View>
        <AppText variant="caption">
          {expense.categoryName ?? 'Uncategorized'} ·{' '}
          {formatDate(expense.expenseDate)} · {expense.paymentMethod}
        </AppText>
      </Card>
    </Pressable>
  );
}
