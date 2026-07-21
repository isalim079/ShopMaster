import { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import {
  useGetMySettingsQuery,
  useUpdateMySettingsMutation,
} from '@/src/features/settings/api/settingsApi';
import type { ServerTheme } from '@/src/features/settings/types';
import {
  AppText,
  Button,
  Card,
  ChipSelect,
  ErrorState,
  LoadingState,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  setPreference,
  type ThemePreference,
} from '@/src/store/themeSlice';

function serverToLocal(theme: ServerTheme): ThemePreference {
  return theme === 'DARK' ? 'dark' : 'light';
}

function localToServer(preference: ThemePreference): ServerTheme {
  return preference === 'dark' ? 'DARK' : 'LIGHT';
}

export function SettingsScreen() {
  const dispatch = useAppDispatch();
  const preference = useAppSelector((s) => s.theme.preference);
  const { data, isLoading, isError, refetch, error } = useGetMySettingsQuery();
  const [updateSettings, { isLoading: saving }] =
    useUpdateMySettingsMutation();
  const [localTheme, setLocalTheme] = useState<ThemePreference>(
    preference === 'system' ? 'light' : preference,
  );

  useEffect(() => {
    if (data?.theme) {
      const mapped = serverToLocal(data.theme);
      setLocalTheme(mapped);
      dispatch(setPreference(mapped));
    }
  }, [data, dispatch]);

  if (isLoading && !data) {
    return <LoadingState message="Loading settings…" />;
  }

  if (isError && !data) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState message={getErrorMessage(error, 'Failed to load')} />
        <View className="px-4 pb-6">
          <Button label="Retry" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  const onSelectTheme = async (next: ThemePreference) => {
    if (next === 'system') return;
    const previous = localTheme;
    setLocalTheme(next);
    dispatch(setPreference(next));
    try {
      await updateSettings({ theme: localToServer(next) }).unwrap();
    } catch (err) {
      setLocalTheme(previous);
      dispatch(setPreference(previous));
      Alert.alert('Error', getErrorMessage(err, 'Could not update theme'));
    }
  };

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="gap-4 px-4 py-6">
        <AppText variant="title">Settings</AppText>
        <AppText variant="caption">
          Appearance and account preferences for this device.
        </AppText>

        <Card className="gap-3">
          <AppText variant="title">Theme</AppText>
          <AppText variant="caption">
            Choose light or dark mode. Synced to your account.
          </AppText>
          <ChipSelect
            options={[
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ]}
            value={localTheme === 'system' ? 'light' : localTheme}
            onChange={(value) => {
              void onSelectTheme(value);
            }}
          />
          {saving ? (
            <AppText variant="caption">Saving…</AppText>
          ) : null}
        </Card>
      </View>
    </ScrollView>
  );
}
