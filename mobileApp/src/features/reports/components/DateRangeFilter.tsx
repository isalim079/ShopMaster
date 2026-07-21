import { View } from 'react-native';

import { Button, TextField } from '@/src/shared/components/ui';

type DateRangeFilterProps = {
  from: string;
  to: string;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
  onApply: () => void;
  loading?: boolean;
};

export function DateRangeFilter({
  from,
  to,
  onChangeFrom,
  onChangeTo,
  onApply,
  loading,
}: DateRangeFilterProps) {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <TextField
            label="From"
            value={from}
            onChangeText={onChangeFrom}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View className="flex-1">
          <TextField
            label="To"
            value={to}
            onChangeText={onChangeTo}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>
      <Button
        label="Apply filters"
        size="sm"
        onPress={onApply}
        loading={loading}
      />
    </View>
  );
}

export function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}
