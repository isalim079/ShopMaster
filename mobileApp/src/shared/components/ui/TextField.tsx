import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/src/theme/cn';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  className?: string;
};

export function TextField({
  label,
  error,
  className,
  ...props
}: TextFieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="font-sans-medium text-label text-foreground dark:text-foreground-dark">
        {label}
      </Text>
      <TextInput
        className={cn(
          'min-h-12 rounded-md border bg-surface px-4 font-sans text-body-lg text-foreground dark:bg-surface-dark dark:text-foreground-dark',
          error ? 'border-danger' : 'border-border dark:border-border-dark',
          className,
        )}
        placeholderTextColor="#94A3B8"
        {...props}
      />
      {error ? (
        <Text className="font-sans text-caption text-danger">{error}</Text>
      ) : null}
    </View>
  );
}
