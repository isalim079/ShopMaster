import { useState } from 'react';
import {
  Pressable,
  RefreshControl,
  TextInput,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Link, router } from 'expo-router';

import { useGetSuppliersQuery } from '@/src/features/supplier/api/supplierApi';
import type { Supplier } from '@/src/features/supplier/types';
import { useDebouncedValue } from '@/src/shared/hooks/useDebouncedValue';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/src/shared/components/ui';
import { formatDate } from '@/src/shared/utils/format';

function SupplierRow({ item }: { item: Supplier }) {
  return (
    <Link href={`/(app)/suppliers/${item.id}/edit`} asChild>
      <Pressable>
        <Card className="mb-3 gap-1">
          <View className="flex-row items-center justify-between gap-2">
            <AppText variant="title" className="flex-1" numberOfLines={1}>
              {item.name}
            </AppText>
            <AppText
              variant="caption"
              className={
                item.status === 'ACTIVE' ? 'text-primary' : 'text-muted'
              }
            >
              {item.status}
            </AppText>
          </View>
          {item.email || item.phone ? (
            <AppText variant="caption" numberOfLines={1}>
              {[item.email, item.phone].filter(Boolean).join(' · ')}
            </AppText>
          ) : null}
          <AppText variant="caption">Updated {formatDate(item.updatedAt)}</AppText>
        </Card>
      </Pressable>
    </Link>
  );
}

export function SupplierListScreen() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetSuppliersQuery({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
    });

  const items = data?.items ?? [];
  const totalPages = data?.meta.totalPages ?? 1;

  if (isLoading && !data) {
    return <LoadingState message="Loading suppliers…" />;
  }

  if (isError && !data) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState
          message={
            (error as { data?: { message?: string } })?.data?.message ??
            'Failed to load suppliers'
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
      <View className="gap-3 px-4 pb-2 pt-3">
        <TextInput
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setPage(1);
          }}
          placeholder="Search suppliers…"
          placeholderTextColor="#94A3B8"
          className="min-h-12 rounded-md border border-border bg-surface px-4 font-sans text-body-lg text-foreground dark:border-border-dark dark:bg-surface-dark dark:text-foreground-dark"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        <Button
          label="Add supplier"
          onPress={() => router.push('/(app)/suppliers/create')}
        />
      </View>

      <FlashList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item }) => <SupplierRow item={item} />}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => {
              if (page !== 1) setPage(1);
              else void refetch();
            }}
            tintColor="#059669"
            colors={['#059669']}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No suppliers"
            description="Add suppliers you purchase stock from."
          />
        }
        onEndReached={() => {
          if (isFetching) return;
          if (page < totalPages) setPage((p) => p + 1);
        }}
        onEndReachedThreshold={0.4}
      />
    </View>
  );
}
