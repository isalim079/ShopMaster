import { useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreateSaleReturnMutation } from '@/src/features/sale-returns/api/saleReturnsApi';
import {
  saleReturnFormSchema,
  type SaleReturnFormInput,
  type SaleReturnFormValues,
} from '@/src/features/sale-returns/schemas/saleReturnSchemas';
import {
  useGetSaleByIdQuery,
  useGetSalesQuery,
} from '@/src/features/sales/api/salesApi';
import { AppText, Button, IdPicker, TextField } from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { emptyToUndefined } from '@/src/shared/lib/format';

function numOpt(value: unknown) {
  if (value === '' || value == null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function SaleReturnFormScreen() {
  const { data: sales } = useGetSalesQuery({
    page: 1,
    limit: 50,
    status: 'COMPLETED',
  });
  const [createReturn, { isLoading }] = useCreateSaleReturnMutation();

  const { control, handleSubmit, watch } = useForm<
    SaleReturnFormInput,
    unknown,
    SaleReturnFormValues
  >({
    resolver: zodResolver(saleReturnFormSchema),
    defaultValues: {
      saleId: '',
      returnDate: '',
      notes: '',
      items: [{ saleItemId: '', quantity: '', unitPrice: '' }],
    },
  });

  const saleId = watch('saleId');
  const { data: sale } = useGetSaleByIdQuery(saleId, { skip: !saleId });
  const { fields, replace } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (!sale) return;
    replace(
      sale.items.map((item) => ({
        saleItemId: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    );
  }, [sale, replace]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const created = await createReturn({
        saleId: values.saleId,
        returnDate: emptyToUndefined(values.returnDate),
        notes: emptyToUndefined(values.notes),
        items: values.items.map((item: SaleReturnFormValues['items'][number]) => ({
          saleItemId: item.saleItemId,
          quantity: Number(item.quantity),
          unitPrice: numOpt(item.unitPrice),
        })),
      }).unwrap();
      router.replace(`/(app)/sale-returns/${created.id}`);
    } catch (error) {
      Alert.alert('Create failed', getErrorMessage(error));
    }
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-background-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="gap-4 px-4 py-6"
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="title">New sale return</AppText>

        <Controller
          control={control}
          name="saleId"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <IdPicker
              label="Sale"
              value={value}
              onChange={onChange}
              error={error?.message}
              options={(sales?.items ?? []).map((s) => ({
                id: s.id,
                label: s.number,
                subtitle: s.customerName ?? 'Walk-in',
              }))}
            />
          )}
        />
        <Controller
          control={control}
          name="returnDate"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Return date (YYYY-MM-DD)"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
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

        {fields.map((field, index) => (
          <View
            key={field.id}
            className="gap-2 rounded-lg border border-border p-3 dark:border-border-dark"
          >
            <AppText variant="label">Line {index + 1}</AppText>
            <Controller
              control={control}
              name={`items.${index}.saleItemId`}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextField
                  label="Sale item ID"
                  value={String(value ?? '')}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name={`items.${index}.quantity`}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextField
                  label="Quantity"
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
              name={`items.${index}.unitPrice`}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextField
                  label="Unit price"
                  value={String(value ?? '')}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  keyboardType="decimal-pad"
                />
              )}
            />
          </View>
        ))}

        <Button label="Create return" onPress={onSubmit} loading={isLoading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
