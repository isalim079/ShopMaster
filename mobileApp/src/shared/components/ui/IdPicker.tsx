import { Pressable, View } from 'react-native';

import { AppText } from './Text';
import { cn } from '@/src/theme/cn';

export type PickerOption = {
  id: string;
  label: string;
  subtitle?: string;
};

type IdPickerProps = {
  label: string;
  options: PickerOption[];
  value?: string | null;
  onChange: (id: string) => void;
  error?: string;
  emptyLabel?: string;
};

export function IdPicker({
  label,
  options,
  value,
  onChange,
  error,
  emptyLabel = 'No options available',
}: IdPickerProps) {
  return (
    <View className="gap-1.5">
      <AppText variant="label">{label}</AppText>
      {options.length === 0 ? (
        <AppText variant="caption">{emptyLabel}</AppText>
      ) : (
        <View className="gap-2">
          {options.map((option) => {
            const selected = value === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => onChange(option.id)}
                className={cn(
                  'rounded-md border px-3 py-3',
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-border dark:border-border-dark',
                )}
              >
                <AppText variant="body">{option.label}</AppText>
                {option.subtitle ? (
                  <AppText variant="caption">{option.subtitle}</AppText>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}
      {error ? (
        <AppText variant="caption" className="text-danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
