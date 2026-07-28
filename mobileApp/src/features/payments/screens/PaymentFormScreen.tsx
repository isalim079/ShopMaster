import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreatePaymentMutation } from '@/src/features/payments/api/paymentsApi';
import {
  paymentFormSchema,
  type PaymentFormInput,
  type PaymentFormValues,
} from '@/src/features/payments/schemas/paymentSchemas';
import {
  AppText,
  Button,
  ChipSelect,
  DateField,
  KeyboardAwareScrollScreen,
  TextField,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { showErrorModal } from '@/src/shared/utils/modal';
import { emptyToUndefined } from '@/src/shared/lib/format';
import { PAYMENT_DIRECTIONS, PAYMENT_METHODS } from '@/src/shared/types/enums';

export function PaymentFormScreen() {
  const [createPayment, { isLoading }] = useCreatePaymentMutation();

  const { control, handleSubmit } = useForm<
    PaymentFormInput,
    unknown,
    PaymentFormValues
  >({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      direction: 'IN',
      method: 'CASH',
      amount: '',
      paymentDate: '',
      reference: '',
      notes: '',
      saleId: '',
      purchaseId: '',
      customerId: '',
      supplierId: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createPayment({
        direction: values.direction,
        method: values.method,
        amount: Number(values.amount),
        paymentDate: emptyToUndefined(values.paymentDate),
        reference: emptyToUndefined(values.reference),
        notes: emptyToUndefined(values.notes),
        saleId: emptyToUndefined(values.saleId),
        purchaseId: emptyToUndefined(values.purchaseId),
        customerId: emptyToUndefined(values.customerId),
        supplierId: emptyToUndefined(values.supplierId),
      }).unwrap();
      router.back();
    } catch (error) {
      showErrorModal('Create failed', getErrorMessage(error));
    }
  });

  return (
    <KeyboardAwareScrollScreen contentContainerClassName="gap-4">
        <AppText variant="title">New payment</AppText>

        <Controller
          control={control}
          name="direction"
          render={({ field: { onChange, value } }) => (
            <ChipSelect
              label="Direction"
              value={value}
              onChange={onChange}
              options={PAYMENT_DIRECTIONS.map((d) => ({
                label: d,
                value: d,
              }))}
            />
          )}
        />
        <Controller
          control={control}
          name="method"
          render={({ field: { onChange, value } }) => (
            <ChipSelect
              label="Method"
              value={value}
              onChange={onChange}
              options={PAYMENT_METHODS.map((method) => ({
                label: method.replace('_', ' '),
                value: method,
              }))}
            />
          )}
        />
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Amount"
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
          name="paymentDate"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <DateField
              label="Payment date"
              value={value ?? ''}
              onChange={onChange}
              error={error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="saleId"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Sale ID"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              autoCapitalize="none"
            />
          )}
        />
        <Controller
          control={control}
          name="purchaseId"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Purchase ID"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              autoCapitalize="none"
            />
          )}
        />
        <Controller
          control={control}
          name="customerId"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Customer ID"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              autoCapitalize="none"
            />
          )}
        />
        <Controller
          control={control}
          name="supplierId"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Supplier ID"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              autoCapitalize="none"
            />
          )}
        />
        <Controller
          control={control}
          name="reference"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Reference"
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

        <Button label="Create payment" onPress={onSubmit} loading={isLoading} />
    </KeyboardAwareScrollScreen>
  );
}
