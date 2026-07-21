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
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useGetBrandByIdQuery,
  useUpdateBrandMutation,
} from '@/src/features/brand/api/brandApi';
import {
  brandFormSchema,
  type BrandFormValues,
} from '@/src/features/brand/schemas';
import {
  AppText,
  Button,
  LoadingState,
  TextField,
} from '@/src/shared/components/ui';
import { emptyToUndefined } from '@/src/shared/utils/format';
import { cn } from '@/src/theme/cn';

type Props = {
  brandId?: string;
};

export function BrandFormScreen({ brandId }: Props) {
  const isEdit = Boolean(brandId);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useGetBrandByIdQuery(brandId!, {
    skip: !brandId,
  });
  const [createBrand, { isLoading: creating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: updating }] = useUpdateBrandMutation();
  const [deleteBrand, { isLoading: deleting }] = useDeleteBrandMutation();

  const { control, handleSubmit, reset } = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        description: data.description ?? '',
        status: data.status,
      });
    }
  }, [data, reset]);

  const saving = creating || updating;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const body = {
      name: values.name.trim(),
      description: emptyToUndefined(values.description),
      status: values.status,
    };

    try {
      if (isEdit && brandId) {
        await updateBrand({ id: brandId, body }).unwrap();
      } else {
        await createBrand(body).unwrap();
      }
      router.back();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Unable to save brand';
      setFormError(message);
      Alert.alert('Save failed', message);
    }
  });

  const onDelete = () => {
    if (!brandId) return;
    Alert.alert('Delete brand', 'This will soft-delete the brand. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBrand(brandId).unwrap();
            router.back();
          } catch (error) {
            const message =
              (error as { data?: { message?: string } })?.data?.message ??
              'Unable to delete brand';
            Alert.alert('Delete failed', message);
          }
        },
      },
    ]);
  };

  if (isEdit && isLoading) {
    return <LoadingState message="Loading brand…" />;
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
          name="description"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Description"
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
          label={isEdit ? 'Save changes' : 'Create brand'}
          onPress={onSubmit}
          loading={saving}
        />

        {isEdit ? (
          <Button
            label="Delete brand"
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
