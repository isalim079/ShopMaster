import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './Text';
import { cn } from '@/src/theme/cn';
import { colors } from '@/src/theme/tokens';

export type SearchableOption = {
  id: string;
  label: string;
  subtitle?: string;
  meta?: string;
};

type SearchableSelectProps = {
  label: string;
  value?: string | null;
  options: SearchableOption[];
  onChange: (id: string, option?: SearchableOption) => void;
  onSearchChange?: (query: string) => void;
  loading?: boolean;
  error?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
};

export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  onSearchChange,
  loading = false,
  error,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyLabel = 'No results',
}: SearchableSelectProps) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = useMemo(
    () => options.find((option) => option.id === value) ?? null,
    [options, value],
  );

  // Local filter when parent does not drive remote search
  const filtered = useMemo(() => {
    if (onSearchChange) return options;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => {
      const hay = `${option.label} ${option.subtitle ?? ''} ${option.meta ?? ''} ${option.id}`.toLowerCase();
      return hay.includes(q);
    });
  }, [options, query, onSearchChange]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      onSearchChange?.('');
    }
  }, [open, onSearchChange]);

  const onQueryChange = (text: string) => {
    setQuery(text);
    onSearchChange?.(text);
  };

  return (
    <View className="gap-1.5">
      {/* Field label */}
      <AppText variant="label">{label}</AppText>

      {/* Select trigger */}
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        className={cn(
          'min-h-12 flex-row items-center gap-2 rounded-md border bg-surface px-3 dark:bg-surface-dark',
          error
            ? 'border-danger'
            : 'border-border dark:border-border-dark',
        )}
      >
        <MaterialCommunityIcons
          name="package-variant-closed"
          size={20}
          color={error ? colors.brand.danger : colors.brand.primary}
        />
        <View className="flex-1">
          {selected ? (
            <>
              <AppText variant="body">{selected.label}</AppText>
              {selected.subtitle ? (
                <AppText variant="caption">{selected.subtitle}</AppText>
              ) : null}
            </>
          ) : (
            <AppText
              variant="body"
              className="text-muted dark:text-muted-dark"
            >
              {placeholder}
            </AppText>
          )}
        </View>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={colors.light.muted}
        />
      </Pressable>

      {error ? (
        <AppText variant="caption" className="text-danger">
          {error}
        </AppText>
      ) : null}

      {/* Searchable options modal */}
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <View
          className="flex-1 bg-surface dark:bg-surface-dark"
          style={{ paddingTop: Math.max(insets.top, 12) }}
        >
          {/* Modal header */}
          <View className="flex-row items-center gap-2 border-b border-border px-4 pb-3 dark:border-border-dark">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={10}
              onPress={() => setOpen(false)}
              className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
            >
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={colors.brand.primary}
              />
            </Pressable>
            <AppText variant="title" className="flex-1">
              {label}
            </AppText>
          </View>

          {/* Search field */}
          <View className="border-b border-border px-4 py-3 dark:border-border-dark">
            <View className="min-h-11 flex-row items-center gap-2 rounded-md border border-border bg-surface-dim px-3 dark:border-border-dark dark:bg-background-dark">
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={colors.light.muted}
              />
              <TextInput
                className="flex-1 py-2 font-sans text-body-lg text-foreground dark:text-foreground-dark"
                value={query}
                onChangeText={onQueryChange}
                placeholder={searchPlaceholder}
                placeholderTextColor="#94A3B8"
                autoCorrect={false}
                autoCapitalize="none"
                autoFocus
              />
              {loading ? <ActivityIndicator size="small" color="#059669" /> : null}
            </View>
          </View>

          {/* Results list */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 16) + 16,
              paddingHorizontal: 16,
              paddingTop: 8,
              flexGrow: 1,
            }}
            renderItem={({ item }) => {
              const isSelected = item.id === value;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item.id, item);
                    setOpen(false);
                  }}
                  className={cn(
                    'mb-2 rounded-lg border px-3 py-3 active:opacity-80',
                    isSelected
                      ? 'border-primary bg-primary-container'
                      : 'border-border dark:border-border-dark',
                  )}
                >
                  <AppText variant="body" className="font-sans-semibold">
                    {item.label}
                  </AppText>
                  {item.subtitle ? (
                    <AppText variant="caption">{item.subtitle}</AppText>
                  ) : null}
                  {item.meta ? (
                    <AppText variant="caption" className="mt-0.5">
                      {item.meta}
                    </AppText>
                  ) : null}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View className="items-center px-4 py-12">
                <AppText variant="caption">
                  {loading ? 'Searching…' : emptyLabel}
                </AppText>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
}
