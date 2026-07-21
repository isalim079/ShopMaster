import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppText, Card } from '@/src/shared/components/ui';

type MoreIcon = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const LINKS: {
  title: string;
  description: string;
  href: string;
  icon: MoreIcon;
}[] = [
  {
    title: 'Customers',
    description: 'Customer directory',
    href: '/(app)/customers',
    icon: 'account-group',
  },
  {
    title: 'Suppliers',
    description: 'Supplier directory',
    href: '/(app)/suppliers',
    icon: 'truck',
  },
  {
    title: 'Brands',
    description: 'Product brands',
    href: '/(app)/brands',
    icon: 'tag',
  },
  {
    title: 'Categories',
    description: 'Product categories',
    href: '/(app)/categories',
    icon: 'shape',
  },
  {
    title: 'Warehouses',
    description: 'Locations & stock points',
    href: '/(app)/warehouses',
    icon: 'warehouse',
  },
  {
    title: 'Products',
    description: 'Catalog and pricing',
    href: '/(app)/products',
    icon: 'package-variant-closed',
  },
  {
    title: 'Inventory',
    description: 'Stock levels and adjustments',
    href: '/(app)/inventory',
    icon: 'cube-outline',
  },
  {
    title: 'Purchases',
    description: 'Orders, receive stock',
    href: '/(app)/purchases',
    icon: 'truck-delivery',
  },
  {
    title: 'Purchase returns',
    description: 'Return goods to suppliers',
    href: '/(app)/purchase-returns',
    icon: 'keyboard-return',
  },
  {
    title: 'Sales',
    description: 'Orders and invoices',
    href: '/(app)/sales',
    icon: 'cash-register',
  },
  {
    title: 'Sale returns',
    description: 'Customer returns',
    href: '/(app)/sale-returns',
    icon: 'backup-restore',
  },
  {
    title: 'Payments',
    description: 'Money in and out',
    href: '/(app)/payments',
    icon: 'cash',
  },
  {
    title: 'Expenses',
    description: 'Operating costs & categories',
    href: '/(app)/expenses',
    icon: 'cash-minus',
  },
  {
    title: 'Reports',
    description: 'Sales, stock, profit & loss',
    href: '/(app)/reports',
    icon: 'chart-box',
  },
  {
    title: 'Notifications',
    description: 'Alerts and updates',
    href: '/(app)/notifications',
    icon: 'bell',
  },
  {
    title: 'Settings',
    description: 'Theme and preferences',
    href: '/(app)/settings',
    icon: 'cog',
  },
  {
    title: 'Profile',
    description: 'Your account and organization',
    href: '/(app)/profile',
    icon: 'account',
  },
];

export default function MoreTab() {
  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="gap-3 px-4 py-6">
        <AppText variant="title">More</AppText>
        <AppText variant="caption">
          Catalog, trading, reports, and account screens.
        </AppText>

        {LINKS.map((link) => (
          <Pressable
            key={link.href}
            onPress={() => router.push(link.href as never)}
          >
            <Card className="flex-row items-center gap-3">
              <MaterialCommunityIcons
                name={link.icon}
                size={24}
                color="#059669"
              />
              <View className="flex-1 gap-0.5">
                <AppText variant="title">{link.title}</AppText>
                <AppText variant="caption">{link.description}</AppText>
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
