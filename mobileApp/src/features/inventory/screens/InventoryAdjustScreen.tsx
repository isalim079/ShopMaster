import { useMemo } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreateInventoryAdjustmentMutation } from '@/src/features/inventory/api/inventoryApi';
import {
  inventoryAdjustSchema,
  type InventoryAdjustFormInput,
  type InventoryAdjustFormValues,
} from '@/src/features/inventory/schemas/inventorySchemas';
import { useGetWarehousesQuery } from '@/src/features/warehouse';
import { useGetProductsQuery } from '@/src/features/products/api/productsApi';
import {
  AppText,
  Button,
  IdPicker,
  KeyboardAwareScrollScreen,
  TextField,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { showErrorModal, showSuccessModal } from '@/src/shared/utils/modal';
import { emptyToUndefined } from '@/src/shared/lib/format';

export function InventoryAdjustScreen() {
  const params = useLocalSearchParams<{
    productId?: string;
    warehouseId?: string;
  }>();
  const { data: products } = useGetProductsQuery({ page: 1, limit: 50 });
  const { data: warehouses } = useGetWarehousesQuery({ page: 1, limit: 50 });
  const [adjust, { isLoading }] = useCreateInventoryAdjustmentMutation();

  const defaultValues = useMemo<InventoryAdjustFormInput>(
    () => ({
      productId: typeof params.productId === 'string' ? params.productId : '',
      warehouseId:
        typeof params.warehouseId === 'string' ? params.warehouseId : '',
      quantity: '',
      note: '',
    }),
    [params.productId, params.warehouseId],
  );

  const { control, handleSubmit } = useForm<
    InventoryAdjustFormInput,
    unknown,
    InventoryAdjustFormValues
  >({
    resolver: zodResolver(inventoryAdjustSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await adjust({
        productId: values.productId,
        warehouseId: values.warehouseId,
        quantity: Number(values.quantity),
        note: emptyToUndefined(values.note),
      }).unwrap();
      showSuccessModal('Adjusted', 'Stock adjustment saved.');
      router.back();
    } catch (error) {
      showErrorModal('Adjustment failed', getErrorMessage(error));
    }
  });

  return (
    <KeyboardAwareScrollScreen contentContainerClassName="gap-4">
        <View className="gap-1">
          <AppText variant="title">Stock adjustment</AppText>
          <AppText variant="caption">
            Use a positive quantity to add stock, negative to remove.
          </AppText>
        </View>

        <Controller
          control={control}
          name="productId"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <IdPicker
              label="Product"
              value={value}
              onChange={onChange}
              error={error?.message}
              options={(products?.items ?? []).map((p) => ({
                id: p.id,
                label: p.name,
                subtitle: p.sku ?? undefined,
              }))}
            />
          )}
        />
        <Controller
          control={control}
          name="warehouseId"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <IdPicker
              label="Warehouse"
              value={value}
              onChange={onChange}
              error={error?.message}
              options={(warehouses?.items ?? []).map((w) => ({
                id: w.id,
                label: w.name,
              }))}
            />
          )}
        />
        <Controller
          control={control}
          name="quantity"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Quantity (+/-)"
              value={String(value ?? '')}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              keyboardType="numbers-and-punctuation"
            />
          )}
        />
        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Reason / note"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
            />
          )}
        />

        <Button label="Save adjustment" onPress={onSubmit} loading={isLoading} />
    </KeyboardAwareScrollScreen>
  );
}
