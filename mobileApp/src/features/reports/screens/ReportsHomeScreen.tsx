import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppText, Card } from '@/src/shared/components/ui';

const REPORTS = [
  {
    title: 'Sales',
    description: 'Orders, totals, and payment status',
    href: '/(app)/reports/sales',
    icon: 'cash-register' as const,
  },
  {
    title: 'Purchases',
    description: 'Supplier orders and spend',
    href: '/(app)/reports/purchases',
    icon: 'truck-delivery' as const,
  },
  {
    title: 'Inventory',
    description: 'Stock levels and value',
    href: '/(app)/reports/inventory',
    icon: 'package-variant' as const,
  },
  {
    title: 'Expenses',
    description: 'Operating costs by period',
    href: '/(app)/reports/expenses',
    icon: 'cash-minus' as const,
  },
  {
    title: 'Profit & loss',
    description: 'Revenue vs costs summary',
    href: '/(app)/reports/profit-loss',
    icon: 'chart-line' as const,
  },
];

export function ReportsHomeScreen() {
  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="gap-3 px-4 py-6">
        <AppText variant="title">Reports</AppText>
        <AppText variant="caption">
          Date-filtered summaries for sales, purchases, stock, and expenses.
        </AppText>

        {REPORTS.map((report) => (
          <Pressable
            key={report.href}
            onPress={() => router.push(report.href as never)}
          >
            <Card className="flex-row items-center gap-3">
              <MaterialCommunityIcons
                name={report.icon}
                size={24}
                color="#059669"
              />
              <View className="flex-1 gap-0.5">
                <AppText variant="title">{report.title}</AppText>
                <AppText variant="caption">{report.description}</AppText>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color="#94A3B8"
              />
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
