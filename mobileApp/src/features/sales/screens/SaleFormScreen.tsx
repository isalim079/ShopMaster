import { useEffect, useMemo } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Controller, useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  useCreateSaleMutation,
  useGetSaleByIdQuery,
  useUpdateSaleMutation,
} from '@/src/features/sales/api/salesApi';
import {
  saleFormSchema,
  type SaleFormInput,
  type SaleFormValues,
} from '@/src/features/sales/schemas/saleSchemas';
import { useGetCustomersQuery } from '@/src/features/customer';
import { useGetWarehousesQuery } from '@/src/features/warehouse';
import { LineItemsEditor } from '@/src/shared/components/LineItemsEditor';
import {
  AppText,
  Button,
  ChipSelect,
  IdPicker,
  LoadingState,
  TextField,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { emptyToUndefined } from '@/src/shared/lib/format';

type SaleFormScreenProps = {
  saleId?: string;
};

function numOpt(value: unknown) {
  if (value === '' || value == null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function SaleFormScreen({ saleId }: SaleFormScreenProps) {
  const isEdit = Boolean(saleId);
  const { data: sale, isLoading } = useGetSaleByIdQuery(saleId!, {
    skip: !saleId,
  });
  const { data: warehouses } = useGetWarehousesQuery({ page: 1, limit: 50 });
  const { data: customers } = useGetCustomersQuery({ page: 1, limit: 50 });
  const [createSale, { isLoading: creating }] = useCreateSaleMutation();
  const [updateSale, { isLoading: updating }] = useUpdateSaleMutation();

  const defaultValues = useMemo<SaleFormInput>(
    () => ({
      warehouseId: '',
      customerId: '',
      saleDate: '',
      status: 'DRAFT',
      discountAmount: '',
      notes: '',
      items: [
        {
          productId: '',
          quantity: '',
          unitPrice: '',
          taxRate: '',
          discount: '',
        },
      ],
    }),
    [],
  );

  const { control, handleSubmit, reset } = useForm<
    SaleFormInput,
    unknown,
    SaleFormValues
  >({
    resolver: zodResolver(saleFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!sale) return;
    reset({
      warehouseId: sale.warehouseId,
      customerId: sale.customerId ?? '',
      saleDate: sale.saleDate?.slice(0, 10) ?? '',
      status: sale.status === 'COMPLETED' ? 'COMPLETED' : 'DRAFT',
      discountAmount: sale.discountAmount,
      notes: sale.notes ?? '',
      items: sale.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        discount: item.discount,
      })),
    });
  }, [sale, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const items = values.items.map((item: SaleFormValues['items'][number]) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: numOpt(item.taxRate),
        discount: numOpt(item.discount),
      }));

      if (isEdit && saleId) {
        await updateSale({
          id: saleId,
          body: {
            warehouseId: values.warehouseId,
            customerId: emptyToUndefined(values.customerId) ?? null,
            saleDate: emptyToUndefined(values.saleDate),
            discountAmount: numOpt(values.discountAmount),
            notes: emptyToUndefined(values.notes) ?? null,
            items,
          },
        }).unwrap();
        router.replace(`/(app)/sales/${saleId}`);
      } else {
        const created = await createSale({
          warehouseId: values.warehouseId,
          customerId: emptyToUndefined(values.customerId),
          saleDate: emptyToUndefined(values.saleDate),
          status: values.status,
          discountAmount: numOpt(values.discountAmount),
          notes: emptyToUndefined(values.notes),
          items,
        }).unwrap();
        router.replace(`/(app)/sales/${created.id}`);
      }
    } catch (error) {
      Alert.alert('Save failed', getErrorMessage(error));
    }
  });

  if (isEdit && isLoading) {
    return <LoadingState message="Loading sale…" />;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-background-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="gap-4 px-4 py-6"
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="title">{isEdit ? 'Edit sale' : 'New sale'}</AppText>

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
          name="customerId"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <IdPicker
              label="Customer (optional)"
              value={value}
              onChange={onChange}
              error={error?.message}
              options={(customers?.items ?? []).map((c) => ({
                id: c.id,
                label: c.name,
              }))}
              emptyLabel="No customers yet"
            />
          )}
        />
        <Controller
          control={control}
          name="saleDate"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Sale date (YYYY-MM-DD)"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
            />
          )}
        />
        {!isEdit ? (
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
                  { label: 'Completed', value: 'COMPLETED' },
                ]}
              />
            )}
          />
        ) : null}
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
          control={control as Control<SaleFormInput>}
          name="items"
          priceLabel="Unit price"
          priceField="unitPrice"
        />

        <Button
          label={isEdit ? 'Update sale' : 'Create sale'}
          onPress={onSubmit}
          loading={creating || updating}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
