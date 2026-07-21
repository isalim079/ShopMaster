import { Alert, ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import {
  useCancelSaleMutation,
  useCompleteSaleMutation,
  useGetSaleByIdQuery,
  useGetSaleInvoiceQuery,
} from '@/src/features/sales/api/salesApi';
import {
  AppText,
  Button,
  Card,
  ErrorState,
  LoadingState,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { formatDate, formatMoney } from '@/src/shared/lib/format';

export function SaleDetailScreen({ saleId }: { saleId: string }) {
  const { data, isLoading, isError, refetch, error } =
    useGetSaleByIdQuery(saleId);
  const { data: invoice } = useGetSaleInvoiceQuery(saleId, {
    skip: !data || data.status === 'DRAFT',
  });
  const [completeSale, { isLoading: completing }] = useCompleteSaleMutation();
  const [cancelSale, { isLoading: cancelling }] = useCancelSaleMutation();

  if (isLoading) return <LoadingState message="Loading sale…" />;
  if (isError || !data) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState
          message={
            (error as { data?: { message?: string } })?.data?.message ??
            'Sale not found'
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
            {data.status} · {data.paymentStatus}
          </AppText>
        </View>

        <Card className="gap-2">
          <Row label="Customer" value={data.customerName ?? 'Walk-in'} />
          <Row label="Warehouse" value={data.warehouseName ?? data.warehouseId} />
          <Row label="Date" value={formatDate(data.saleDate)} />
          <Row label="Subtotal" value={formatMoney(data.subtotal)} />
          <Row label="Tax" value={formatMoney(data.taxAmount)} />
          <Row label="Discount" value={formatMoney(data.discountAmount)} />
          <Row label="Total" value={formatMoney(data.total)} />
          <Row label="Paid" value={formatMoney(data.paidAmount)} />
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
                Qty {item.quantity} × {formatMoney(item.unitPrice)} ={' '}
                {formatMoney(item.lineTotal)}
              </AppText>
            </View>
          ))}
        </Card>

        {invoice ? (
          <Card className="gap-2">
            <AppText variant="title">Invoice</AppText>
            <Row label="Balance due" value={formatMoney(invoice.balanceDue)} />
            <Row
              label="Org"
              value={invoice.organizationName ?? invoice.organizationId}
            />
          </Card>
        ) : null}

        {data.status === 'DRAFT' ? (
          <>
            <Button
              label="Edit draft"
              variant="outline"
              onPress={() => router.push(`/(app)/sales/${saleId}/edit`)}
            />
            <Button
              label="Complete sale"
              loading={completing}
              onPress={async () => {
                try {
                  await completeSale(saleId).unwrap();
                  refetch();
                } catch (err) {
                  Alert.alert('Complete failed', getErrorMessage(err));
                }
              }}
            />
          </>
        ) : null}

        {data.status !== 'CANCELLED' ? (
          <Button
            label="Cancel sale"
            variant="danger"
            loading={cancelling}
            onPress={() => {
              Alert.alert('Cancel sale?', undefined, [
                { text: 'Keep', style: 'cancel' },
                {
                  text: 'Cancel',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await cancelSale(saleId).unwrap();
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
      <AppText variant="body" className="flex-1 text-right">
        {value}
      </AppText>
    </View>
  );
}
