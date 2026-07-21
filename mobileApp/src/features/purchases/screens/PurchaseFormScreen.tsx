import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Controller, useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreatePurchaseMutation } from '@/src/features/purchases/api/purchasesApi';
import {
  purchaseFormSchema,
  type PurchaseFormInput,
  type PurchaseFormValues,
} from '@/src/features/purchases/schemas/purchaseSchemas';
import { useGetSuppliersQuery } from '@/src/features/supplier';
import { useGetWarehousesQuery } from '@/src/features/warehouse';
import { LineItemsEditor } from '@/src/shared/components/LineItemsEditor';
import {
  AppText,
  Button,
  ChipSelect,
  IdPicker,
  TextField,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { emptyToUndefined } from '@/src/shared/lib/format';

function numOpt(v: unknown) {
  if (v === '' || v === undefined || v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function PurchaseFormScreen() {
  const { data: suppliers } = useGetSuppliersQuery({ page: 1, limit: 50 });
  const { data: warehouses } = useGetWarehousesQuery({ page: 1, limit: 50 });
  const [createPurchase, { isLoading }] = useCreatePurchaseMutation();

  const { control, handleSubmit } = useForm<
    PurchaseFormInput,
    unknown,
    PurchaseFormValues
  >({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      supplierId: '',
      warehouseId: '',
      orderDate: '',
      status: 'DRAFT',
      discountAmount: '',
      notes: '',
      items: [
        {
          productId: '',
          quantity: '',
          unitCost: '',
          taxRate: '',
          discount: '',
        },
      ],
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const created = await createPurchase({
        supplierId: values.supplierId,
        warehouseId: values.warehouseId,
        orderDate: emptyToUndefined(values.orderDate),
        status: values.status,
        discountAmount: numOpt(values.discountAmount),
        notes: emptyToUndefined(values.notes),
        items: values.items.map((item: PurchaseFormValues['items'][number]) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
          taxRate: numOpt(item.taxRate),
          discount: numOpt(item.discount),
        })),
      }).unwrap();
      router.replace(`/(app)/purchases/${created.id}`);
    } catch (error) {
      Alert.alert('Create failed', getErrorMessage(error));
    }
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-background-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="gap-4 px-4 py-6" keyboardShouldPersistTaps="handled">
        <AppText variant="title">New purchase</AppText>

        <Controller
          control={control}
          name="supplierId"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <IdPicker
              label="Supplier"
              value={value}
              onChange={onChange}
              error={error?.message}
              options={(suppliers?.items ?? []).map((s) => ({ id: s.id, label: s.name }))}
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
              options={(warehouses?.items ?? []).map((w) => ({ id: w.id, label: w.name }))}
            />
          )}
        />
        <Controller
          control={control}
          name="orderDate"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Order date (YYYY-MM-DD)"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              placeholder="2026-07-21"
            />
          )}
        />
        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <ChipSelect
              label="Status"
              value={value}
              onChange={onChange}
              options={[
                { label: 'Draft', value: 'DRAFT' },
                { label: 'Ordered', value: 'ORDERED' },
              ]}
            />
          )}
        />
        <Controller
          control={control}
          name="discountAmount"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Discount amount"
              value={String(value ?? '')}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              keyboardType="decimal-pad"
            />
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Notes"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              multiline
            />
          )}
        />

        <LineItemsEditor
          control={control as Control<PurchaseFormInput>}
          name="items"
          priceLabel="Unit cost"
          priceField="unitCost"
        />

        <Button label="Create purchase" onPress={onSubmit} loading={isLoading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
