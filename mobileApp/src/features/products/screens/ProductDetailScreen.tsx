import { Alert, ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import {
  useDeleteProductMutation,
  useGetProductByIdQuery,
} from '@/src/features/products/api/productsApi';
import {
  AppText,
  Button,
  Card,
  ErrorState,
  LoadingState,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { formatMoney } from '@/src/shared/lib/format';

type ProductDetailScreenProps = {
  productId: string;
};

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const { data, isLoading, isError, refetch, error } =
    useGetProductByIdQuery(productId);
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

  const onDelete = () => {
    Alert.alert('Delete product', 'Mark this product inactive/delete?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(productId).unwrap();
            router.back();
          } catch (err) {
            Alert.alert('Delete failed', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  if (isLoading) return <LoadingState message="Loading product…" />;
  if (isError || !data) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState
          message={
            (error as { data?: { message?: string } })?.data?.message ??
            'Product not found'
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
          <AppText variant="headline">{data.name}</AppText>
          <AppText variant="caption">{data.status}</AppText>
        </View>

        <Card className="gap-2">
          <Row label="SKU" value={data.sku ?? '—'} />
          <Row label="Barcode" value={data.barcode ?? '—'} />
          <Row label="Unit" value={data.unit} />
          <Row label="Purchase" value={formatMoney(data.purchasePrice)} />
          <Row label="Sale" value={formatMoney(data.salePrice)} />
          <Row label="Tax" value={`${data.taxRate}%`} />
          <Row
            label="Reorder level"
            value={data.reorderLevel != null ? String(data.reorderLevel) : '—'}
          />
          <Row label="Total stock" value={String(data.totalStock ?? 0)} />
        </Card>

        {data.description ? (
          <Card className="gap-1">
            <AppText variant="title">Description</AppText>
            <AppText variant="body">{data.description}</AppText>
          </Card>
        ) : null}

        {(data.stocks?.length ?? 0) > 0 ? (
          <Card className="gap-2">
            <AppText variant="title">Stock by warehouse</AppText>
            {data.stocks!.map((stock) => (
              <View
                key={stock.warehouseId}
                className="flex-row items-center justify-between"
              >
                <AppText variant="body">{stock.warehouseName}</AppText>
                <AppText variant="body">{stock.quantity}</AppText>
              </View>
            ))}
          </Card>
        ) : null}

        <Button
          label="Edit"
          onPress={() => router.push(`/(app)/products/${productId}/edit`)}
        />
        <Button
          label="Delete"
          variant="danger"
          loading={deleting}
          onPress={onDelete}
        />
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <AppText variant="caption">{label}</AppText>
      <AppText variant="body" className="flex-1 text-right">
        {value}
      </AppText>
    </View>
  );
}
