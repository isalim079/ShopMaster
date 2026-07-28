import { View } from 'react-native';
import {
  Controller,
  useFieldArray,
  useWatch,
  type Control,
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormSetValue,
} from 'react-hook-form';

import {
  AppText,
  Button,
  ProductSelect,
  TextField,
} from '@/src/shared/components/ui';

type LineItemsEditorProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  priceLabel: string;
  priceField: 'unitCost' | 'unitPrice';
  setValue?: UseFormSetValue<T>;
  /** Hide per-line discount when order-level discount is used instead */
  showLineDiscount?: boolean;
};

export function LineItemsEditor<T extends FieldValues>({
  control,
  name,
  priceLabel,
  priceField,
  setValue,
  showLineDiscount = true,
}: LineItemsEditorProps<T>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never,
  });

  // Watch items so product price autofill can target current row values
  useWatch({ control, name: name as Path<T> });

  return (
    <View className="gap-3">
      {/* Line items header */}
      <View className="flex-row items-center justify-between">
        <AppText variant="title">Line items</AppText>
        <Button
          label="Add line"
          size="sm"
          variant="outline"
          onPress={() =>
            append({
              productId: '',
              quantity: '',
              [priceField]: '',
              taxRate: '',
              discount: '',
            } as never)
          }
        />
      </View>

      {fields.map((field, index) => (
        <View
          key={field.id}
          className="gap-2 rounded-lg border border-border p-3 dark:border-border-dark"
        >
          <AppText variant="label">Item {index + 1}</AppText>

          {/* Product search dropdown */}
          <Controller
            control={control}
            name={`${String(name)}.${index}.productId` as Path<T>}
            render={({
              field: { onChange, value },
              fieldState: { error },
            }) => (
              <ProductSelect
                label="Product"
                value={value ? String(value) : ''}
                error={error?.message}
                onChange={(productId, product) => {
                  onChange(productId);
                  if (product && setValue) {
                    const price =
                      priceField === 'unitPrice'
                        ? product.salePrice
                        : product.purchasePrice;
                    setValue(
                      `${String(name)}.${index}.${priceField}` as Path<T>,
                      String(price) as PathValue<T, Path<T>>,
                      { shouldValidate: true },
                    );
                    if (product.taxRate != null) {
                      setValue(
                        `${String(name)}.${index}.taxRate` as Path<T>,
                        String(product.taxRate) as PathValue<T, Path<T>>,
                        { shouldValidate: true },
                      );
                    }
                  }
                }}
              />
            )}
          />

          <Controller
            control={control}
            name={`${String(name)}.${index}.quantity` as Path<T>}
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
            name={`${String(name)}.${index}.${priceField}` as Path<T>}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <TextField
                label={priceLabel}
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
            name={`${String(name)}.${index}.taxRate` as Path<T>}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <TextField
                label="Tax %"
                value={String(value ?? '')}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
                keyboardType="decimal-pad"
              />
            )}
          />
          {showLineDiscount ? (
            <Controller
              control={control}
              name={`${String(name)}.${index}.discount` as Path<T>}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextField
                  label="Discount"
                  value={String(value ?? '')}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  keyboardType="decimal-pad"
                />
              )}
            />
          ) : null}
          {fields.length > 1 ? (
            <Button
              label="Remove"
              size="sm"
              variant="ghost"
              onPress={() => remove(index)}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}
