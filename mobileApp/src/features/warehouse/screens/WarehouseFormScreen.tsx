import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  useCreateWarehouseMutation,
  useDeleteWarehouseMutation,
  useGetWarehouseByIdQuery,
  useUpdateWarehouseMutation,
} from '@/src/features/warehouse/api/warehouseApi';
import {
  warehouseFormSchema,
  type WarehouseFormValues,
} from '@/src/features/warehouse/schemas';
import {
  AppText,
  Button,
  LoadingState,
  TextField,
} from '@/src/shared/components/ui';
import { emptyToUndefined } from '@/src/shared/utils/format';
import { cn } from '@/src/theme/cn';

type Props = {
  warehouseId?: string;
};

export function WarehouseFormScreen({ warehouseId }: Props) {
  const isEdit = Boolean(warehouseId);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useGetWarehouseByIdQuery(warehouseId!, {
    skip: !warehouseId,
  });
  const [createWarehouse, { isLoading: creating }] =
    useCreateWarehouseMutation();
  const [updateWarehouse, { isLoading: updating }] =
    useUpdateWarehouseMutation();
  const [deleteWarehouse, { isLoading: deleting }] =
    useDeleteWarehouseMutation();

  const { control, handleSubmit, reset } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      country: '',
      isDefault: false,
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        address: data.address ?? '',
        city: data.city ?? '',
        country: data.country ?? '',
        isDefault: data.isDefault,
        status: data.status,
      });
    }
  }, [data, reset]);

  const saving = creating || updating;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const body = {
      name: values.name.trim(),
      address: emptyToUndefined(values.address),
      city: emptyToUndefined(values.city),
      country: emptyToUndefined(values.country),
      isDefault: values.isDefault,
      status: values.status,
    };

    try {
      if (isEdit && warehouseId) {
        await updateWarehouse({ id: warehouseId, body }).unwrap();
      } else {
        await createWarehouse(body).unwrap();
      }
      router.back();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Unable to save warehouse';
      setFormError(message);
      Alert.alert('Save failed', message);
    }
  });

  const onDelete = () => {
    if (!warehouseId) return;
    Alert.alert(
      'Delete warehouse',
      'This will soft-delete the warehouse. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWarehouse(warehouseId).unwrap();
              router.back();
            } catch (error) {
              const message =
                (error as { data?: { message?: string } })?.data?.message ??
                'Unable to delete warehouse';
              Alert.alert('Delete failed', message);
            }
          },
        },
      ],
    );
  };

  if (isEdit && isLoading) {
    return <LoadingState message="Loading warehouse…" />;
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
          name="isDefault"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row items-center justify-between rounded-md border border-border px-4 py-3 dark:border-border-dark">
              <View className="flex-1 pr-3">
                <AppText variant="label">Default warehouse</AppText>
                <AppText variant="caption">
                  Used as the default stock location
                </AppText>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: '#CBD5E1', true: '#6EE7B7' }}
                thumbColor={value ? '#059669' : '#F8FAFC'}
              />
            </View>
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
          label={isEdit ? 'Save changes' : 'Create warehouse'}
          onPress={onSubmit}
          loading={saving}
        />

        {isEdit ? (
          <Button
            label="Delete warehouse"
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
