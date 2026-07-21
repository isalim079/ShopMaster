import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import { useLogoutMutation } from '@/src/features/auth/api/authApi';
import {
  clearTokens,
  getRefreshToken,
} from '@/src/features/auth/services/tokenStorage';
import { clearSession } from '@/src/features/auth/slices/authSlice';
import {
  useGetSummaryQuery,
  useGetTopCustomersQuery,
  useGetTopProductsQuery,
} from '@/src/features/dashboard/api/dashboardApi';
import {
  AppText,
  Button,
  Card,
  ErrorState,
  LoadingState,
} from '@/src/shared/components/ui';
import { formatCurrency } from '@/src/shared/utils/format';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';

const QUICK_ACTIONS = [
  { label: 'New sale', href: '/(app)/sales/create' },
  { label: 'New product', href: '/(app)/products/create' },
  { label: 'New purchase', href: '/(app)/purchases/create' },
] as const;

export function DashboardScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: summary,
    isLoading,
    isError,
    refetch: refetchSummary,
    error,
  } = useGetSummaryQuery();
  const { data: topProducts, refetch: refetchProducts } =
    useGetTopProductsQuery({ days: 30, limit: 5 });
  const { data: topCustomers, refetch: refetchCustomers } =
    useGetTopCustomersQuery({ days: 30, limit: 5 });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchSummary(),
        refetchProducts(),
        refetchCustomers(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchSummary, refetchProducts, refetchCustomers]);

  const onLogout = async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await logout({ refreshToken }).unwrap();
      }
    } catch {
      // Local logout even if API fails
    } finally {
      await clearTokens();
      dispatch(clearSession());
      router.replace('/(auth)/login');
    }
  };

  if (isLoading && !summary) {
    return <LoadingState message="Loading dashboard…" />;
  }

  if (isError && !summary) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState
          message={
            (error as { data?: { message?: string } })?.data?.message ??
            'Failed to load dashboard'
          }
        />
        <View className="px-4 pb-6">
          <Button label="Retry" onPress={() => refetchSummary()} />
        </View>
      </View>
    );
  }

  const kpis = [
    {
      label: 'Sales today',
      value: formatCurrency(summary?.salesToday.total ?? 0),
      hint: `${summary?.salesToday.count ?? 0} orders`,
    },
    {
      label: 'Purchases today',
      value: formatCurrency(summary?.purchasesToday.total ?? 0),
      hint: `${summary?.purchasesToday.count ?? 0} orders`,
    },
    {
      label: 'Expenses today',
      value: formatCurrency(summary?.expensesToday.total ?? 0),
      hint: `${summary?.expensesToday.count ?? 0} entries`,
    },
    {
      label: 'Stock value',
      value: formatCurrency(summary?.stockValue ?? 0),
      hint: 'On hand',
    },
    {
      label: 'Low stock',
      value: String(summary?.lowStockCount ?? 0),
      hint: 'Products below threshold',
    },
    {
      label: 'Unpaid sales',
      value: formatCurrency(summary?.unpaidSales ?? 0),
      hint: 'Receivables',
    },
    {
      label: 'Unpaid purchases',
      value: formatCurrency(summary?.unpaidPurchases ?? 0),
      hint: 'Payables',
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-background-dark"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="gap-4 px-4 py-6">
        <View className="gap-1">
          <AppText variant="caption">Welcome back</AppText>
          <AppText variant="headline">
            {user?.firstName ?? 'Shop owner'}
          </AppText>
          <AppText variant="caption">
            {user?.organization?.name ?? 'Your organization'}
          </AppText>
        </View>

        <View className="flex-row flex-wrap gap-3">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="w-[47%] gap-1">
              <AppText variant="caption">{kpi.label}</AppText>
              <AppText variant="title">{kpi.value}</AppText>
              <AppText variant="caption">{kpi.hint}</AppText>
            </Card>
          ))}
        </View>

        <Card className="gap-3">
          <AppText variant="title">Quick actions</AppText>
          <View className="flex-row flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.href}
                label={action.label}
                size="sm"
                onPress={() => router.push(action.href as never)}
                className="flex-1"
              />
            ))}
          </View>
        </Card>

        {topProducts && topProducts.length > 0 ? (
          <Card className="gap-2">
            <AppText variant="title">Top products</AppText>
            {topProducts.map((row) => (
              <View
                key={row.productId}
                className="flex-row items-center justify-between"
              >
                <View className="flex-1 pr-2">
                  <AppText variant="body">{row.productName}</AppText>
                  <AppText variant="caption">Qty {row.quantity}</AppText>
                </View>
                <AppText variant="body">{formatCurrency(row.total)}</AppText>
              </View>
            ))}
          </Card>
        ) : null}

        {topCustomers && topCustomers.length > 0 ? (
          <Card className="gap-2">
            <AppText variant="title">Top customers</AppText>
            {topCustomers.map((row) => (
              <View
                key={row.customerId}
                className="flex-row items-center justify-between"
              >
                <View className="flex-1 pr-2">
                  <AppText variant="body">{row.customerName}</AppText>
                  <AppText variant="caption">{row.count} sales</AppText>
                </View>
                <AppText variant="body">{formatCurrency(row.amount)}</AppText>
              </View>
            ))}
          </Card>
        ) : null}

        <Button
          label="Sign out"
          variant="outline"
          onPress={onLogout}
          loading={loggingOut}
        />
      </View>
    </ScrollView>
  );
}
