import { TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { cn } from '@/src/theme/cn';

type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search…',
  className,
}: SearchFieldProps) {
  return (
    <View
      className={cn(
        'min-h-12 flex-row items-center gap-2 rounded-md border border-border bg-surface px-3 dark:border-border-dark dark:bg-surface-dark',
        className,
      )}
    >
      <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
      <TextInput
        className="flex-1 font-sans text-body-lg text-foreground dark:text-foreground-dark"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}
