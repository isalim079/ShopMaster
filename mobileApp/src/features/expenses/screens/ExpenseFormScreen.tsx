import { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  useCreateExpenseMutation,
  useGetExpenseByIdQuery,
  useGetExpenseCategoriesQuery,
  useUpdateExpenseMutation,
} from '@/src/features/expenses/api/expensesApi';
import {
  expenseFormSchema,
  type ExpenseFormInput,
  type ExpenseFormValues,
} from '@/src/features/expenses/schemas/expenseSchemas';
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
import { emptyToUndefined } from '@/src/shared/lib/format';
import { PAYMENT_METHODS } from '@/src/shared/types/enums';

type ExpenseFormScreenProps = {
  expenseId?: string;
};

export function ExpenseFormScreen({ expenseId }: ExpenseFormScreenProps) {
  const isEdit = Boolean(expenseId);
  const { data: expense, isLoading } = useGetExpenseByIdQuery(expenseId!, {
    skip: !expenseId,
  });
  const { data: categories } = useGetExpenseCategoriesQuery({
    page: 1,
    limit: 50,
  });
  const [createExpense, { isLoading: creating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: updating }] = useUpdateExpenseMutation();

  const defaultValues = useMemo<ExpenseFormInput>(
    () => ({
      title: '',
      amount: '',
      categoryId: '',
      expenseDate: '',
      paymentMethod: 'CASH',
      reference: '',
      notes: '',
    }),
    [],
  );

  const { control, handleSubmit, reset } = useForm<
    ExpenseFormInput,
    unknown,
    ExpenseFormValues
  >({
    resolver: zodResolver(expenseFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!expense) return;
    reset({
      title: expense.title,
      amount: expense.amount,
      categoryId: expense.categoryId ?? '',
      expenseDate: expense.expenseDate?.slice(0, 10) ?? '',
      paymentMethod: expense.paymentMethod,
      reference: expense.reference ?? '',
      notes: expense.notes ?? '',
    });
  }, [expense, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        title: values.title.trim(),
        amount: Number(values.amount),
        categoryId: emptyToUndefined(values.categoryId),
        expenseDate: emptyToUndefined(values.expenseDate),
        paymentMethod: values.paymentMethod,
        reference: emptyToUndefined(values.reference),
        notes: emptyToUndefined(values.notes),
      };

      if (isEdit && expenseId) {
        await updateExpense({
          id: expenseId,
          body: {
            ...payload,
            categoryId: payload.categoryId ?? null,
            reference: payload.reference ?? null,
            notes: payload.notes ?? null,
          },
        }).unwrap();
      } else {
        await createExpense(payload).unwrap();
      }
      router.back();
    } catch (error) {
      showErrorModal('Save failed', getErrorMessage(error));
    }
  });

  if (isEdit && isLoading) {
    return <LoadingState message="Loading expense…" />;
  }

  return (
    <KeyboardAwareScrollScreen contentContainerClassName="gap-4">
        <AppText variant="title">
          {isEdit ? 'Edit expense' : 'New expense'}
        </AppText>

        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Title"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
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
          name="categoryId"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <IdPicker
              label="Category"
              value={value}
              onChange={onChange}
              error={error?.message}
              options={(categories?.items ?? []).map((c) => ({
                id: c.id,
                label: c.name,
              }))}
              emptyLabel="No categories yet"
            />
          )}
        />
        <Controller
          control={control}
          name="expenseDate"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <DateField
              label="Expense date"
              value={value ?? ''}
              onChange={onChange}
              error={error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field: { onChange, value } }) => (
            <ChipSelect
              label="Payment method"
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

        <Button
          label={isEdit ? 'Update expense' : 'Create expense'}
          onPress={onSubmit}
          loading={creating || updating}
        />
    </KeyboardAwareScrollScreen>
  );
}
