import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppText } from './Text';
import { Button } from './Button';
import { cn } from '@/src/theme/cn';
import { colors } from '@/src/theme/tokens';
import { useResolvedTheme } from '@/src/theme/useResolvedTheme';

type DateFieldProps = {
  label: string;
  value?: string | null;
  onChange: (isoDate: string) => void;
  error?: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
};

function parseIsoDate(value?: string | null): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(value?: string | null): string {
  const date = parseIsoDate(value);
  if (!date) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function DateField({
  label,
  value,
  onChange,
  error,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
}: DateFieldProps) {
  const { isDark } = useResolvedTheme();
  const [open, setOpen] = useState(false);
  const selected = parseIsoDate(value) ?? new Date();
  const [draft, setDraft] = useState(selected);

  useEffect(() => {
    if (open) {
      setDraft(parseIsoDate(value) ?? new Date());
    }
  }, [open, value]);

  const onValueChange = (_event: unknown, date: Date) => {
    if (Platform.OS === 'android') {
      setOpen(false);
      onChange(toIsoDate(date));
      return;
    }
    setDraft(date);
  };

  const onDismiss = () => {
    setOpen(false);
  };

  const confirmIos = () => {
    onChange(toIsoDate(draft));
    setOpen(false);
  };

  return (
    <View className="gap-1.5">
      {/* Field label */}
      <AppText variant="label">{label}</AppText>

      {/* Date trigger */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
        className={cn(
          'min-h-12 flex-row items-center gap-2 rounded-md border bg-surface px-3 dark:bg-surface-dark',
          error
            ? 'border-danger'
            : 'border-border dark:border-border-dark',
        )}
      >
        <MaterialCommunityIcons
          name="calendar-month-outline"
          size={20}
          color={error ? colors.brand.danger : colors.brand.primary}
        />
        <AppText
          variant="body"
          className={cn(
            'flex-1',
            !value && 'text-muted dark:text-muted-dark',
          )}
        >
          {value ? formatDisplay(value) : placeholder}
        </AppText>
        {value ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear date"
            hitSlop={10}
            onPress={() => onChange('')}
            className="p-1 active:opacity-70"
          >
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={18}
              color={colors.light.muted}
            />
          </Pressable>
        ) : null}
      </Pressable>

      {error ? (
        <AppText variant="caption" className="text-danger">
          {error}
        </AppText>
      ) : null}

      {/* Android inline system calendar */}
      {open && Platform.OS === 'android' ? (
        <DateTimePicker
          value={selected}
          mode="date"
          display="calendar"
          onValueChange={onValueChange}
          onDismiss={onDismiss}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}

      {/* iOS modal calendar sheet */}
      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="fade">
          <Pressable
            className="flex-1 justify-end bg-black/45"
            onPress={() => setOpen(false)}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="rounded-t-2xl border-t border-border bg-surface px-4 pb-8 pt-4 dark:border-border-dark dark:bg-surface-dark"
            >
              <View className="mb-3 flex-row items-center justify-between">
                <AppText variant="title">{label}</AppText>
                <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                  <MaterialCommunityIcons
                    name="close"
                    size={22}
                    color={isDark ? colors.dark.foreground : colors.light.foreground}
                  />
                </Pressable>
              </View>
              <DateTimePicker
                value={draft}
                mode="date"
                display="inline"
                onValueChange={onValueChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                themeVariant={isDark ? 'dark' : 'light'}
              />
              {/* Action buttons */}
              <View className="mt-3 flex-row gap-3">
                <Button
                  label="Cancel"
                  variant="outline"
                  className="flex-1"
                  onPress={() => setOpen(false)}
                />
                <Button
                  label="Done"
                  className="flex-1"
                  onPress={confirmIos}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}
