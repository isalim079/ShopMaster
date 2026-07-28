import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Flag,
  getAllCountries,
  FlagType,
  type Country,
  type CountryCode,
} from 'react-native-country-picker-modal';
import {
  AsYouType,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode as PhoneCountryCode,
} from 'libphonenumber-js';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFormKeyboardScroll } from '@/src/shared/components/ui/KeyboardAwareScrollScreen';
import { scrollFocusedInputIntoView } from '@/src/shared/lib/scrollInputIntoView';
import { cn } from '@/src/theme/cn';
import { colors } from '@/src/theme/tokens';

export type PhoneFieldProps = {
  label?: string;
  countryCode: CountryCode;
  onCountryChange: (code: CountryCode) => void;
  value: string;
  onChangeNational: (national: string) => void;
  onChangeE164: (e164: string | undefined) => void;
  error?: string;
  optional?: boolean;
};

export function toE164(
  country: CountryCode,
  national: string,
): string | undefined {
  const digits = national.replace(/\D/g, '');
  if (!digits) return undefined;
  const parsed = parsePhoneNumberFromString(
    digits,
    country as PhoneCountryCode,
  );
  if (!parsed?.isValid()) return undefined;
  return parsed.format('E.164');
}

function countryName(country: Country): string {
  if (typeof country.name === 'string') return country.name;
  return country.name.common ?? country.cca2;
}

function dialCodeFor(country: CountryCode): string {
  try {
    return getCountryCallingCode(country as PhoneCountryCode);
  } catch {
    return '';
  }
}

export function PhoneField({
  label = 'Phone',
  countryCode,
  onCountryChange,
  value,
  onChangeNational,
  onChangeE164,
  error,
  optional = true,
}: PhoneFieldProps) {
  const formScroll = useFormKeyboardScroll();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [callingCode, setCallingCode] = useState(() => dialCodeFor(countryCode));
  const [countries, setCountries] = useState<Country[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setCallingCode(dialCodeFor(countryCode));
  }, [countryCode]);

  useEffect(() => {
    let alive = true;
    getAllCountries(
      FlagType.EMOJI,
      'common',
      undefined,
      undefined,
      undefined,
      undefined,
      ['BD', 'US', 'GB', 'IN', 'AE', 'SA'],
    )
      .then((list) => {
        if (alive) setCountries(list);
      })
      .catch(() => {
        if (alive) setCountries([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const displayValue = useMemo(() => {
    if (!value) return '';
    return new AsYouType(countryCode as PhoneCountryCode).input(value);
  }, [countryCode, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => {
      const name = countryName(c).toLowerCase();
      const dial = (c.callingCode ?? []).join(' ');
      return (
        name.includes(q) ||
        c.cca2.toLowerCase().includes(q) ||
        dial.includes(q.replace('+', ''))
      );
    });
  }, [countries, query]);

  const onSelect = (country: Country) => {
    const code = country.cca2;
    setCallingCode(country.callingCode?.[0] ?? dialCodeFor(code));
    onCountryChange(code);
    onChangeE164(toE164(code, value));
    setQuery('');
    setPickerOpen(false);
  };

  const onChangeText = (text: string) => {
    const formatted = new AsYouType(countryCode as PhoneCountryCode).input(text);
    onChangeNational(formatted);
    onChangeE164(toE164(countryCode, formatted));
  };

  return (
    <View className="gap-1.5">
      <Text className="font-sans-medium text-label text-foreground dark:text-foreground-dark">
        {optional ? `${label} (optional)` : label}
      </Text>
      <View
        className={cn(
          'min-h-12 flex-row items-center overflow-hidden rounded-md border bg-surface dark:bg-surface-dark',
          error
            ? 'border-danger'
            : focused
              ? 'border-primary'
              : 'border-border dark:border-border-dark',
        )}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select country calling code"
          onPress={() => setPickerOpen(true)}
          className="h-12 flex-row items-center gap-1.5 border-r border-border px-2.5 active:opacity-70 dark:border-border-dark"
        >
          <Flag countryCode={countryCode} withEmoji flagSize={18} />
          <Text className="font-sans-medium text-body text-foreground dark:text-foreground-dark">
            +{callingCode}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={18}
            color={colors.light.muted}
          />
        </Pressable>

        <TextInput
          className="min-h-12 flex-1 px-3 font-sans text-body-lg text-foreground dark:text-foreground-dark"
          value={displayValue}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          placeholder="Mobile number"
          placeholderTextColor="#94A3B8"
          onFocus={(e) => {
            setFocused(true);
            if (formScroll) {
              scrollFocusedInputIntoView(e, formScroll.scrollRef, {
                scrollY: formScroll.scrollY.current,
                keyboardHeight: formScroll.keyboardHeight,
              });
            }
          }}
          onBlur={() => setFocused(false)}
        />
      </View>
      {error ? (
        <Text className="font-sans text-caption text-danger">{error}</Text>
      ) : null}

      <Modal
        visible={pickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setQuery('');
          setPickerOpen(false);
        }}
      >
        <SafeAreaView
          edges={['top', 'left', 'right', 'bottom']}
          style={{ flex: 1, backgroundColor: colors.light.surface }}
        >
          <View className="flex-row items-center gap-2 border-b border-border px-4 pb-3 pt-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close country picker"
              hitSlop={10}
              onPress={() => {
                setQuery('');
                setPickerOpen(false);
              }}
              className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
            >
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={colors.light.foreground}
              />
            </Pressable>
            <Text className="flex-1 font-sans-semibold text-title text-foreground">
              Country code
            </Text>
          </View>

          <View className="border-b border-border px-4 py-3">
            <View className="min-h-11 flex-row items-center gap-2 rounded-md border border-border bg-surface-dim px-3">
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={colors.light.muted}
              />
              <TextInput
                className="flex-1 py-2 font-sans text-body-lg text-foreground"
                value={query}
                onChangeText={setQuery}
                placeholder="Search country or code"
                placeholderTextColor="#94A3B8"
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
            </View>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.cca2}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{ paddingBottom: 16 }}
            renderItem={({ item }) => {
              const dial = item.callingCode?.[0] ?? '';
              const name = countryName(item);
              const selected = item.cca2 === countryCode;
              return (
                <Pressable
                  onPress={() => onSelect(item)}
                  className={cn(
                    'min-h-14 flex-row items-center gap-3 border-b border-divider px-4 active:bg-surface-dim',
                    selected && 'bg-primary-container',
                  )}
                >
                  <Flag countryCode={item.cca2} withEmoji flagSize={20} />
                  <Text className="flex-1 font-sans text-body-lg text-foreground">
                    {name}
                  </Text>
                  <Text className="font-sans-medium text-body text-muted">
                    +{dial}
                  </Text>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View className="items-center px-4 py-10">
                <Text className="font-sans text-body text-muted">
                  No countries match
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
