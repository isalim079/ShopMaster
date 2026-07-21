import { ScrollView, View } from 'react-native';

import { useGetPurchaseReturnByIdQuery } from '@/src/features/purchase-returns/api/purchaseReturnsApi';
import {
  AppText,
  Button,
  Card,
  ErrorState,
  LoadingState,
} from '@/src/shared/components/ui';
import { formatDate, formatMoney } from '@/src/shared/lib/format';

export function PurchaseReturnDetailScreen({ returnId }: { returnId: string }) {
  const { data, isLoading, isError, refetch, error } =
    useGetPurchaseReturnByIdQuery(returnId);

  if (isLoading) return <LoadingState message="Loading return…" />;
  if (isError || !data) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState
          message={
            (error as { data?: { message?: string } })?.data?.message ??
            'Not found'
          }
        />
        <View className="px-4 pb-6">
          <Button label="Retry" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="gap-4 px-4 py-6">
        <View className="gap-1">
          <AppText variant="headline">{data.number}</AppText>
          <AppText variant="caption">
            {data.status} · {formatDate(data.returnDate)}
          </AppText>
        </View>

        <Card className="gap-2">
          <Row label="Purchase" value={data.purchaseNumber ?? data.purchaseId} />
          <Row label="Supplier" value={data.supplierName ?? data.supplierId} />
          <Row label="Warehouse" value={data.warehouseName ?? data.warehouseId} />
          <Row label="Total" value={formatMoney(data.total)} />
        </Card>

        <Card className="gap-2">
          <AppText variant="title">Items</AppText>
          {data.items.map((item) => (
            <View
              key={item.id}
              className="border-t border-border pt-2 dark:border-border-dark"
            >
              <AppText variant="body">
                {item.productName ?? item.productId}
              </AppText>
              <AppText variant="caption">
                Qty {item.quantity} · {formatMoney(item.lineTotal)}
              </AppText>
            </View>
          ))}
        </Card>

        {data.notes ? (
          <Card>
            <AppText variant="body">{data.notes}</AppText>
          </Card>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-3">
      <AppText variant="caption">{label}</AppText>
      <AppText variant="body" className="flex-1 text-right">
        {value}
      </AppText>
    </View>
  );
}
