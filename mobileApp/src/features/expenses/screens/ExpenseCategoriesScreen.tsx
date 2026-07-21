import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  useCreateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
  useGetExpenseCategoriesQuery,
} from '@/src/features/expenses/api/expensesApi';
import {
  expenseCategoryFormSchema,
  type ExpenseCategoryFormValues,
} from '@/src/features/expenses/schemas/expenseSchemas';
import type { ExpenseCategory } from '@/src/features/expenses/types';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  TextField,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { emptyToUndefined } from '@/src/shared/lib/format';

export function ExpenseCategoriesScreen() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch, error } =
    useGetExpenseCategoriesQuery({ page, limit: 50 });
  const [createCategory, { isLoading: creating }] =
    useCreateExpenseCategoryMutation();
  const [deleteCategory] = useDeleteExpenseCategoryMutation();

  const { control, handleSubmit, reset } = useForm<ExpenseCategoryFormValues>({
    resolver: zodResolver(expenseCategoryFormSchema),
    defaultValues: { name: '', description: '', status: 'ACTIVE' },
  });

  const onCreate = handleSubmit(async (values) => {
    try {
      await createCategory({
        name: values.name.trim(),
        description: emptyToUndefined(values.description),
        status: values.status,
      }).unwrap();
      reset({ name: '', description: '', status: 'ACTIVE' });
      setPage(1);
      refetch();
    } catch (err) {
      Alert.alert('Create failed', getErrorMessage(err));
    }
  });

  if (isLoading && page === 1) {
    return <LoadingState message="Loading categories…" />;
  }

  if (isError && !data) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState
          message={
            (error as { data?: { message?: string } })?.data?.message ??
            'Failed to load'
          }
        />
        <View className="px-4 pb-6">
          <Button label="Retry" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <View className="gap-3 border-b border-border px-4 py-4 dark:border-border-dark">
        <AppText variant="title">Expense categories</AppText>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value }, fieldState: { error: fieldError } }) => (
            <TextField
              label="Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldError?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value }, fieldState: { error: fieldError } }) => (
            <TextField
              label="Description"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldError?.message}
            />
          )}
        />
        <Button label="Add category" onPress={onCreate} loading={creating} />
      </View>

      <FlashList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        onEndReached={() => {
          if (isFetching) return;
          if (page < (data?.meta.totalPages ?? 1)) setPage((p) => p + 1);
        }}
        refreshing={isFetching && page === 1}
        onRefresh={() => {
          setPage(1);
          refetch();
        }}
        ListEmptyComponent={
          <EmptyState
            title="No categories"
            description="Add categories to classify expenses."
          />
        }
        renderItem={({ item }) => (
          <CategoryRow
            category={item}
            onDelete={() => {
              Alert.alert('Delete category?', item.name, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteCategory(item.id).unwrap();
                    } catch (err) {
                      Alert.alert('Delete failed', getErrorMessage(err));
                    }
                  },
                },
              ]);
            }}
          />
        )}
      />
    </View>
  );
}

function CategoryRow({
  category,
  onDelete,
}: {
  category: ExpenseCategory;
  onDelete: () => void;
}) {
  return (
    <Card className="mb-3 gap-2">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 gap-1">
          <AppText variant="title">{category.name}</AppText>
          <AppText variant="caption">{category.status}</AppText>
          {category.description ? (
            <AppText variant="caption">{category.description}</AppText>
          ) : null}
        </View>
        <Pressable onPress={onDelete}>
          <AppText variant="caption" className="text-danger">
            Delete
          </AppText>
        </Pressable>
      </View>
    </Card>
  );
}
