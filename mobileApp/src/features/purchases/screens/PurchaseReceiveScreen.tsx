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

import {
  useGetPurchaseByIdQuery,
  useReceivePurchaseMutation,
} from '@/src/features/purchases/api/purchasesApi';
import {
  receivePurchaseSchema,
  type ReceivePurchaseFormInput,
  type ReceivePurchaseFormValues,
} from '@/src/features/purchases/schemas/purchaseSchemas';
import {
  AppText,
  Button,
  LoadingState,
  TextField,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';

export function PurchaseReceiveScreen({ purchaseId }: { purchaseId: string }) {
  const { data, isLoading } = useGetPurchaseByIdQuery(purchaseId);
  const [receive, { isLoading: saving }] = useReceivePurchaseMutation();

  const { control, handleSubmit, reset } = useForm<
    ReceivePurchaseFormInput,
    unknown,
    ReceivePurchaseFormValues
  >({
    resolver: zodResolver(receivePurchaseSchema),
    defaultValues: { items: [] },
  });
  const { fields } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (!data) return;
    reset({
      items: data.items
        .filter((item) => item.receivedQty < item.quantity)
        .map((item) => ({
          purchaseItemId: item.id,
          quantity: item.quantity - item.receivedQty,
          productName: item.productName ?? item.productId,
          remaining: item.quantity - item.receivedQty,
        })),
    });
  }, [data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await receive({
        id: purchaseId,
        body: {
          items: values.items.map(
            (item: ReceivePurchaseFormValues['items'][number]) => ({
              purchaseItemId: item.purchaseItemId,
              quantity: Number(item.quantity),
            }),
          ),
        },
      }).unwrap();
      router.replace(`/(app)/purchases/${purchaseId}`);
    } catch (error) {
      Alert.alert('Receive failed', getErrorMessage(error));
    }
  });

  if (isLoading || !data) return <LoadingState message="Loading purchase…" />;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-background-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="gap-4 px-4 py-6" keyboardShouldPersistTaps="handled">
        <AppText variant="title">Receive {data.number}</AppText>
        {fields.length === 0 ? (
          <AppText variant="caption">Nothing left to receive.</AppText>
        ) : (
          fields.map((field, index) => (
            <View key={field.id} className="gap-2 rounded-lg border border-border p-3 dark:border-border-dark">
              <AppText variant="body">{field.productName}</AppText>
              <AppText variant="caption">Remaining {field.remaining}</AppText>
              <Controller
                control={control}
                name={`items.${index}.quantity`}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <TextField
                    label="Receive qty"
                    value={String(value ?? '')}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={error?.message}
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </View>
          ))
        )}
        <Button
          label="Confirm receive"
          onPress={onSubmit}
          loading={saving}
          disabled={fields.length === 0}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
