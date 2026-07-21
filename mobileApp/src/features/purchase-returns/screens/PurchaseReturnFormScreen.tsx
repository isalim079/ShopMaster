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

import { useCreatePurchaseReturnMutation } from '@/src/features/purchase-returns/api/purchaseReturnsApi';
import {
  purchaseReturnFormSchema,
  type PurchaseReturnFormInput,
  type PurchaseReturnFormValues,
} from '@/src/features/purchase-returns/schemas/purchaseReturnSchemas';
import {
  useGetPurchaseByIdQuery,
  useGetPurchasesQuery,
} from '@/src/features/purchases/api/purchasesApi';
import { AppText, Button, IdPicker, TextField } from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { emptyToUndefined } from '@/src/shared/lib/format';

function numOpt(value: unknown) {
  if (value === '' || value == null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function PurchaseReturnFormScreen() {
  const { data: purchases } = useGetPurchasesQuery({ page: 1, limit: 50 });
  const [createReturn, { isLoading }] = useCreatePurchaseReturnMutation();

  const { control, handleSubmit, watch } = useForm<
    PurchaseReturnFormInput,
    unknown,
    PurchaseReturnFormValues
  >({
    resolver: zodResolver(purchaseReturnFormSchema),
    defaultValues: {
      purchaseId: '',
      returnDate: '',
      notes: '',
      items: [{ purchaseItemId: '', quantity: '', unitCost: '' }],
    },
  });

  const purchaseId = watch('purchaseId');
  const { data: purchase } = useGetPurchaseByIdQuery(purchaseId, {
    skip: !purchaseId,
  });
  const { fields, replace } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (!purchase) return;
    replace(
      purchase.items.map((item) => ({
        purchaseItemId: item.id,
        quantity: Math.max(item.receivedQty || item.quantity, 1),
        unitCost: item.unitCost,
      })),
    );
  }, [purchase, replace]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const created = await createReturn({
        purchaseId: values.purchaseId,
        returnDate: emptyToUndefined(values.returnDate),
        notes: emptyToUndefined(values.notes),
        items: values.items.map((item: PurchaseReturnFormValues['items'][number]) => ({
          purchaseItemId: item.purchaseItemId,
          quantity: Number(item.quantity),
          unitCost: numOpt(item.unitCost),
        })),
      }).unwrap();
      router.replace(`/(app)/purchase-returns/${created.id}`);
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
        <AppText variant="title">New purchase return</AppText>

        <Controller
          control={control}
          name="purchaseId"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <IdPicker
              label="Purchase"
              value={value}
              onChange={onChange}
              error={error?.message}
              options={(purchases?.items ?? []).map((p) => ({
                id: p.id,
                label: p.number,
                subtitle: p.supplierName,
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
              name={`items.${index}.purchaseItemId`}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextField
                  label="Purchase item ID"
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
              name={`items.${index}.unitCost`}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextField
                  label="Unit cost"
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
