import { useEffect, useMemo } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  useCreateProductMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from '@/src/features/products/api/productsApi';
import {
  productFormSchema,
  type ProductFormInput,
  type ProductFormValues,
} from '@/src/features/products/schemas/productSchemas';
import type { ProductInput, ProductUpdateInput } from '@/src/features/products/types';
import { useGetBrandsQuery } from '@/src/features/brand';
import { useGetCategoriesQuery } from '@/src/features/category';
import { useGetWarehousesQuery } from '@/src/features/warehouse';
import {
  AppText,
  Button,
  ChipSelect,
  IdPicker,
  LoadingState,
  TextField,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { emptyToUndefined } from '@/src/shared/lib/format';

type ProductFormScreenProps = {
  productId?: string;
};

function toNumberOrUndefined(value: unknown) {
  if (value === '' || value === undefined || value === null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function buildPayload(values: ProductFormValues): ProductInput {
  return {
    name: values.name.trim(),
    sku: emptyToUndefined(values.sku),
    barcode: emptyToUndefined(values.barcode),
    description: emptyToUndefined(values.description),
    categoryId: emptyToUndefined(values.categoryId),
    brandId: emptyToUndefined(values.brandId),
    unit: emptyToUndefined(values.unit) ?? 'pcs',
    purchasePrice: Number(values.purchasePrice),
    salePrice: Number(values.salePrice),
    taxRate: toNumberOrUndefined(values.taxRate),
    reorderLevel: toNumberOrUndefined(values.reorderLevel),
    warehouseId: emptyToUndefined(values.warehouseId),
    openingStock: toNumberOrUndefined(values.openingStock),
    status: values.status,
  };
}

export function ProductFormScreen({ productId }: ProductFormScreenProps) {
  const isEdit = Boolean(productId);
  const { data: product, isLoading: loadingProduct } = useGetProductByIdQuery(
    productId!,
    { skip: !productId },
  );
  const { data: categories } = useGetCategoriesQuery({ page: 1, limit: 50 });
  const { data: brands } = useGetBrandsQuery({ page: 1, limit: 50 });
  const { data: warehouses } = useGetWarehousesQuery({ page: 1, limit: 50 });
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  const defaultValues = useMemo<ProductFormInput>(
    () => ({
      name: '',
      sku: '',
      barcode: '',
      description: '',
      categoryId: '',
      brandId: '',
      unit: 'pcs',
      purchasePrice: '',
      salePrice: '',
      taxRate: '',
      reorderLevel: '',
      warehouseId: '',
      openingStock: '',
      status: 'ACTIVE',
    }),
    [],
  );

  const { control, handleSubmit, reset } = useForm<
    ProductFormInput,
    unknown,
    ProductFormValues
  >({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!product) return;
    reset({
      name: product.name,
      sku: product.sku ?? '',
      barcode: product.barcode ?? '',
      description: product.description ?? '',
      categoryId: product.categoryId ?? '',
      brandId: product.brandId ?? '',
      unit: product.unit ?? 'pcs',
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      taxRate: product.taxRate ?? '',
      reorderLevel: product.reorderLevel ?? '',
      warehouseId: '',
      openingStock: '',
      status: product.status,
    });
  }, [product, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = buildPayload(values);
      if (isEdit && productId) {
        const body: ProductUpdateInput = { ...payload };
        delete (body as ProductInput).warehouseId;
        delete (body as ProductInput).openingStock;
        await updateProduct({ id: productId, body }).unwrap();
        router.replace(`/(app)/products/${productId}`);
      } else {
        const created = await createProduct(payload).unwrap();
        router.replace(`/(app)/products/${created.id}`);
      }
    } catch (error) {
      Alert.alert('Save failed', getErrorMessage(error));
    }
  });

  if (isEdit && loadingProduct) {
    return <LoadingState message="Loading product…" />;
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
        <AppText variant="title">{isEdit ? 'Edit product' : 'New product'}</AppText>

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
            />
          )}
        />
        <Controller
          control={control}
          name="sku"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="SKU"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="barcode"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Barcode"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Description"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              multiline
            />
          )}
        />
        <Controller
          control={control}
          name="unit"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Unit"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              placeholder="pcs"
            />
          )}
        />
        <Controller
          control={control}
          name="purchasePrice"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Purchase price"
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
          name="salePrice"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Sale price"
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
          name="taxRate"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Tax rate %"
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
          name="reorderLevel"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Reorder level"
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
          name="brandId"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <IdPicker
              label="Brand"
              value={value}
              onChange={onChange}
              error={error?.message}
              options={(brands?.items ?? []).map((b) => ({
                id: b.id,
                label: b.name,
              }))}
              emptyLabel="No brands yet"
            />
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <ChipSelect
              label="Status"
              value={value}
              onChange={onChange}
              options={[
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' },
              ]}
            />
          )}
        />

        {!isEdit ? (
          <>
            <Controller
              control={control}
              name="warehouseId"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <IdPicker
                  label="Opening stock warehouse"
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                  options={(warehouses?.items ?? []).map((w) => ({
                    id: w.id,
                    label: w.name,
                    subtitle: w.code ?? undefined,
                  }))}
                  emptyLabel="No warehouses yet"
                />
              )}
            />
            <Controller
              control={control}
              name="openingStock"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextField
                  label="Opening stock"
                  value={String(value ?? '')}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  keyboardType="decimal-pad"
                />
              )}
            />
          </>
        ) : null}

        <Button
          label={isEdit ? 'Update product' : 'Create product'}
          onPress={onSubmit}
          loading={creating || updating}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
