import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  useCreateCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
} from '@/src/features/customer/api/customerApi';
import {
  customerFormSchema,
  type CustomerFormValues,
} from '@/src/features/customer/schemas';
import {
  AppText,
  Button,
  LoadingState,
  TextField,
} from '@/src/shared/components/ui';
import { emptyToUndefined } from '@/src/shared/utils/format';
import { cn } from '@/src/theme/cn';

type Props = {
  customerId?: string;
};

export function CustomerFormScreen({ customerId }: Props) {
  const isEdit = Boolean(customerId);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useGetCustomerByIdQuery(customerId!, {
    skip: !customerId,
  });
  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: updating }] = useUpdateCustomerMutation();
  const [deleteCustomer, { isLoading: deleting }] = useDeleteCustomerMutation();

  const { control, handleSubmit, reset } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      taxId: '',
      creditLimit: '',
      notes: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        email: data.email ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
        country: data.country ?? '',
        taxId: data.taxId ?? '',
        creditLimit:
          data.creditLimit != null ? String(data.creditLimit) : '',
        notes: data.notes ?? '',
        status: data.status,
      });
    }
  }, [data, reset]);

  const saving = creating || updating;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const creditRaw = emptyToUndefined(values.creditLimit);
    const creditLimit =
      creditRaw != null ? Number(creditRaw) : undefined;

    if (creditRaw != null && Number.isNaN(creditLimit)) {
      setFormError('Credit limit must be a number');
      return;
    }
    if (creditLimit != null && creditLimit < 0) {
      setFormError('Credit limit cannot be negative');
      return;
    }

    const body = {
      name: values.name.trim(),
      email: emptyToUndefined(values.email),
      phone: emptyToUndefined(values.phone),
      address: emptyToUndefined(values.address),
      city: emptyToUndefined(values.city),
      country: emptyToUndefined(values.country),
      taxId: emptyToUndefined(values.taxId),
      creditLimit,
      notes: emptyToUndefined(values.notes),
      status: values.status,
    };

    try {
      if (isEdit && customerId) {
        await updateCustomer({ id: customerId, body }).unwrap();
      } else {
        await createCustomer(body).unwrap();
      }
      router.back();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Unable to save customer';
      setFormError(message);
      Alert.alert('Save failed', message);
    }
  });

  const onDelete = () => {
    if (!customerId) return;
    Alert.alert(
      'Delete customer',
      'This will soft-delete the customer. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomer(customerId).unwrap();
              router.back();
            } catch (error) {
              const message =
                (error as { data?: { message?: string } })?.data?.message ??
                'Unable to delete customer';
              Alert.alert('Delete failed', message);
            }
          },
        },
      ],
    );
  };

  if (isEdit && isLoading) {
    return <LoadingState message="Loading customer…" />;
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
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Phone"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              keyboardType="phone-pad"
            />
          )}
        />

        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="city"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="City"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="country"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Country"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="taxId"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Tax ID"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              autoCapitalize="characters"
            />
          )}
        />

        <Controller
          control={control}
          name="creditLimit"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Credit limit"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          )}
        />

        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Notes"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              multiline
              className="min-h-24 py-3"
            />
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <View className="gap-1.5">
              <AppText variant="label">Status</AppText>
              <View className="flex-row gap-2">
                {(['ACTIVE', 'INACTIVE'] as const).map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => onChange(status)}
                    className={cn(
                      'rounded-md border px-4 py-2',
                      value === status
                        ? 'border-primary bg-primary/10'
                        : 'border-border dark:border-border-dark',
                    )}
                  >
                    <AppText
                      variant="caption"
                      className={value === status ? 'text-primary' : undefined}
                    >
                      {status}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        />

        {formError ? (
          <AppText variant="caption" className="text-danger">
            {formError}
          </AppText>
        ) : null}

        <Button
          label={isEdit ? 'Save changes' : 'Create customer'}
          onPress={onSubmit}
          loading={saving}
        />

        {isEdit ? (
          <Button
            label="Delete customer"
            variant="danger"
            onPress={onDelete}
            loading={deleting}
            disabled={saving}
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
