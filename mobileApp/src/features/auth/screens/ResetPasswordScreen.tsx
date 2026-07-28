import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useResetPasswordMutation } from '@/src/features/auth/api/authApi';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/src/features/auth/schemas/authSchemas';
import {
  AppText,
  Button,
  KeyboardAwareScrollScreen,
  TextField,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { showSuccessModal } from '@/src/shared/utils/modal';
import { colors } from '@/src/theme/tokens';

export function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ resetToken?: string }>();
  const resetToken =
    typeof params.resetToken === 'string' ? params.resetToken : '';

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      resetToken,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    if (!values.resetToken) {
      setFormError('Reset session expired. Request a new code.');
      return;
    }
    try {
      const result = await resetPassword({
        resetToken: values.resetToken,
        password: values.password,
      }).unwrap();

      showSuccessModal('Password updated', result.message, [
        {
          text: 'Sign in',
          onPress: () => router.replace('/login'),
        },
      ]);
    } catch (error) {
      setFormError(
        getErrorMessage(error, 'Could not reset password. Request a new code.'),
      );
    }
  });

  if (!resetToken) {
    return (
      <KeyboardAwareScrollScreen centerContent>
        <View className="gap-4">
          <AppText variant="headline">Reset session expired</AppText>
          <AppText variant="caption">
            Request a new password reset code to continue.
          </AppText>
          <Button
            label="Forgot password"
            icon="lock-reset"
            onPress={() => router.replace('/forgot-password')}
          />
        </View>
      </KeyboardAwareScrollScreen>
    );
  }

  return (
    <KeyboardAwareScrollScreen centerContent>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to sign in"
        hitSlop={12}
        onPress={() => router.replace('/login')}
        className="mb-4 h-10 w-10 items-center justify-center rounded-full border border-border bg-surface active:opacity-70 dark:border-border-dark dark:bg-surface-dark"
      >
        <MaterialCommunityIcons
          name="close"
          size={22}
          color={colors.brand.primary}
        />
      </Pressable>

      <View className="mb-6 gap-1">
        <AppText variant="headline">Set new password</AppText>
        <AppText variant="caption">
          Use at least 8 characters with upper, lower, number, and special
          character.
        </AppText>
      </View>

      <View className="gap-4 rounded-lg border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark">
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="New password"
              leftIcon="lock-outline"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              placeholder="New password"
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Confirm password"
              leftIcon="lock-check-outline"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              placeholder="Confirm password"
              onSubmitEditing={onSubmit}
            />
          )}
        />

        {formError ? (
          <View className="flex-row items-start gap-2 rounded-md bg-danger/10 px-3 py-2.5">
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={18}
              color={colors.brand.danger}
            />
            <AppText className="flex-1 text-danger" variant="caption">
              {formError}
            </AppText>
          </View>
        ) : null}

        <Button
          label="Update password"
          icon="check-circle-outline"
          onPress={onSubmit}
          loading={isLoading}
          size="lg"
        />
      </View>
    </KeyboardAwareScrollScreen>
  );
}
