import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from './Text';
import { cn } from '@/src/theme/cn';

type Option<T extends string> = {
  label: string;
  value: T;
};

type ChipSelectProps<T extends string> = {
  label?: string;
  options: Option<T>[];
  value?: T | null;
  onChange: (value: T) => void;
  allowClear?: boolean;
  className?: string;
};

export function ChipSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  allowClear = false,
  className,
}: ChipSelectProps<T>) {
  return (
    <View className={cn('gap-1.5', className)}>
      {label ? <AppText variant="label">{label}</AppText> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {allowClear ? (
            <Pressable
              onPress={() => onChange('' as T)}
              className={cn(
                'rounded-md border px-3 py-2',
                !value
                  ? 'border-primary bg-primary/10'
                  : 'border-border dark:border-border-dark',
              )}
            >
              <AppText variant="caption">All</AppText>
            </Pressable>
          ) : null}
          {options.map((option) => {
            const selected = value === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onChange(option.value)}
                className={cn(
                  'rounded-md border px-3 py-2',
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-border dark:border-border-dark',
                )}
              >
                <AppText
                  variant="caption"
                  className={selected ? 'text-primary' : undefined}
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
