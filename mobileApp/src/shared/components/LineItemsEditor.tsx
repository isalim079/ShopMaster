import { View } from 'react-native';
import {
  Controller,
  useFieldArray,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';

import { AppText, Button, TextField } from '@/src/shared/components/ui';

type LineItemsEditorProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  priceLabel: string;
  priceField: 'unitCost' | 'unitPrice';
};

export function LineItemsEditor<T extends FieldValues>({
  control,
  name,
  priceLabel,
  priceField,
}: LineItemsEditorProps<T>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never,
  });

  return (
    <View className="gap-3">
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
          <Controller
            control={control}
            name={`${String(name)}.${index}.productId` as Path<T>}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <TextField
                label="Product ID"
                value={String(value ?? '')}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
                autoCapitalize="none"
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
