import { Alert, ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import {
  useCancelPurchaseMutation,
  useGetPurchaseByIdQuery,
} from '@/src/features/purchases/api/purchasesApi';
import {
  AppText,
  Button,
  Card,
  ErrorState,
  LoadingState,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { formatDate, formatMoney } from '@/src/shared/lib/format';

export function PurchaseDetailScreen({ purchaseId }: { purchaseId: string }) {
  const { data, isLoading, isError, refetch, error } = useGetPurchaseByIdQuery(purchaseId);
  const [cancelPurchase, { isLoading: cancelling }] = useCancelPurchaseMutation();

  if (isLoading) return <LoadingState message="Loading purchase…" />;
  if (isError || !data) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState message={(error as { data?: { message?: string } })?.data?.message ?? 'Not found'} />
        <View className="px-4 pb-6"><Button label="Retry" onPress={() => refetch()} /></View>
      </View>
    );
  }

  const canReceive = ['ORDERED', 'PARTIAL'].includes(data.status);

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="gap-4 px-4 py-6">
        <View className="gap-1">
          <AppText variant="headline">{data.number}</AppText>
          <AppText variant="caption">{data.status} · {data.paymentStatus}</AppText>
        </View>

        <Card className="gap-2">
          <Row label="Supplier" value={data.supplierName ?? data.supplierId} />
          <Row label="Warehouse" value={data.warehouseName ?? data.warehouseId} />
          <Row label="Order date" value={formatDate(data.orderDate)} />
          <Row label="Subtotal" value={formatMoney(data.subtotal)} />
          <Row label="Tax" value={formatMoney(data.taxAmount)} />
          <Row label="Discount" value={formatMoney(data.discountAmount)} />
          <Row label="Total" value={formatMoney(data.total)} />
          <Row label="Paid" value={formatMoney(data.paidAmount)} />
        </Card>

        <Card className="gap-2">
          <AppText variant="title">Items</AppText>
          {data.items.map((item) => (
            <View key={item.id} className="border-t border-border pt-2 dark:border-border-dark">
              <AppText variant="body">{item.productName ?? item.productId}</AppText>
              <AppText variant="caption">
                Qty {item.quantity} · Recv {item.receivedQty} · {formatMoney(item.lineTotal)}
              </AppText>
            </View>
          ))}
        </Card>

        {canReceive ? (
          <Button
            label="Receive stock"
            onPress={() => router.push(`/(app)/purchases/${purchaseId}/receive`)}
          />
        ) : null}
        {data.status !== 'CANCELLED' && data.status !== 'RECEIVED' ? (
          <Button
            label="Cancel purchase"
            variant="danger"
            loading={cancelling}
            onPress={() => {
              Alert.alert('Cancel purchase?', 'This cannot be undone.', [
                { text: 'Keep', style: 'cancel' },
                {
                  text: 'Cancel',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await cancelPurchase(purchaseId).unwrap();
                      refetch();
                    } catch (err) {
                      Alert.alert('Failed', getErrorMessage(err));
                    }
                  },
                },
              ]);
            }}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-3">
      <AppText variant="caption">{label}</AppText>
      <AppText variant="body" className="flex-1 text-right">{value}</AppText>
    </View>
  );
}
