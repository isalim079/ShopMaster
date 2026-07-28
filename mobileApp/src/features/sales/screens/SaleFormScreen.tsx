import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Controller, useForm, useWatch, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  useCreateSaleMutation,
  useGetSaleByIdQuery,
  useUpdateSaleMutation,
} from '@/src/features/sales/api/salesApi';
import { SaleTotalsCard } from '@/src/features/sales/components/SaleTotalsCard';
import {
  computeSaleFormTotals,
  toOrderDiscountAmount,
  type DiscountType,
} from '@/src/features/sales/lib/saleTotals';
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
  DateField,
  IdPicker,
  KeyboardAwareScrollScreen,
  LoadingState,
  TextField,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { showErrorModal } from '@/src/shared/utils/modal';
import { emptyToUndefined, formatMoney } from '@/src/shared/lib/format';

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
      discountType: 'AMOUNT',
      discountValue: '',
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

  const { control, handleSubmit, reset, setValue } = useForm<
    SaleFormInput,
    unknown,
    SaleFormValues
  >({
    resolver: zodResolver(saleFormSchema),
    defaultValues,
  });

  // Live totals — watch line + order discount fields
  const watchedItems = useWatch({ control, name: 'items' });
  const discountType = (useWatch({ control, name: 'discountType' }) ??
    'AMOUNT') as DiscountType;
  const discountValue = useWatch({ control, name: 'discountValue' });

  const totals = useMemo(
    () =>
      computeSaleFormTotals(
        watchedItems ?? [],
        discountType,
        discountValue,
      ),
    [watchedItems, discountType, discountValue],
  );

  useEffect(() => {
    if (!sale) return;
    reset({
      warehouseId: sale.warehouseId,
      customerId: sale.customerId ?? '',
      saleDate: sale.saleDate?.slice(0, 10) ?? '',
      status: sale.status === 'COMPLETED' ? 'COMPLETED' : 'DRAFT',
      discountType: 'AMOUNT',
      discountValue: sale.discountAmount,
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
        discount: 0,
      }));

      const discountAmount = toOrderDiscountAmount(
        values.discountType,
        values.discountValue,
        computeSaleFormTotals(
          values.items,
          values.discountType,
          values.discountValue,
        ).subtotal,
      );

      if (isEdit && saleId) {
        await updateSale({
          id: saleId,
          body: {
            warehouseId: values.warehouseId,
            customerId: emptyToUndefined(values.customerId) ?? null,
            saleDate: emptyToUndefined(values.saleDate),
            discountAmount,
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
          discountAmount,
          notes: emptyToUndefined(values.notes),
          items,
        }).unwrap();
        router.replace(`/(app)/sales/${created.id}`);
      }
    } catch (error) {
      showErrorModal('Save failed', getErrorMessage(error));
    }
  });

  if (isEdit && isLoading) {
    return <LoadingState message="Loading sale…" />;
  }

  return (
    <KeyboardAwareScrollScreen contentContainerClassName="gap-4">
      <AppText variant="title">{isEdit ? 'Edit sale' : 'New sale'}</AppText>

      {/* Header fields */}
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
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <DateField
            label="Sale date"
            value={value ?? ''}
            onChange={onChange}
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

      {/* Line items */}
      <LineItemsEditor
        control={control as Control<SaleFormInput>}
        name="items"
        priceLabel="Unit price"
        priceField="unitPrice"
        setValue={setValue}
        showLineDiscount={false}
      />

      {/* Single order-level discount */}
      <View className="gap-3 rounded-lg border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
        <AppText variant="title">Discount</AppText>
        <Controller
          control={control}
          name="discountType"
          render={({ field: { onChange, value } }) => (
            <ChipSelect
              label="Discount type"
              value={value}
              onChange={(next) => {
                onChange(next);
                setValue('discountValue', '');
              }}
              options={[
                { label: 'Amount', value: 'AMOUNT' },
                { label: 'Percentage', value: 'PERCENTAGE' },
              ]}
            />
          )}
        />
        <Controller
          control={control}
          name="discountValue"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label={
                discountType === 'PERCENTAGE'
                  ? 'Discount (%)'
                  : 'Discount amount'
              }
              value={String(value ?? '')}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              keyboardType="decimal-pad"
              placeholder={
                discountType === 'PERCENTAGE' ? 'e.g. 10' : 'e.g. 50'
              }
            />
          )}
        />
        {discountType === 'PERCENTAGE' && totals.orderDiscount > 0 ? (
          <AppText variant="caption">
            Equals {formatMoney(totals.orderDiscount)} off subtotal
          </AppText>
        ) : null}
      </View>

      {/* Live totals */}
      <SaleTotalsCard totals={totals} />

      {/* Submit */}
      <Button
        label={isEdit ? 'Update sale' : 'Create sale'}
        onPress={onSubmit}
        loading={creating || updating}
        size="lg"
      />
    </KeyboardAwareScrollScreen>
  );
}
