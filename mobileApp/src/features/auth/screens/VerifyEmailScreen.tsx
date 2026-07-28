import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from '@/src/features/auth/api/authApi';
import {
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from '@/src/features/auth/schemas/authSchemas';
import { getErrorMessage } from '@/src/shared/lib/errors';
import {
  showErrorModal,
  showSuccessModal,
} from '@/src/shared/utils/modal';
import {
  Button,
  TextField,
  AppText,
  KeyboardAwareScrollScreen,
} from '@/src/shared/components/ui';
import { colors } from '@/src/theme/tokens';

export function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resend, { isLoading: isResending }] = useResendVerificationMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, getValues } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: typeof params.email === 'string' ? params.email : '',
      otp: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await verifyEmail(values).unwrap();
      showSuccessModal('Email verified', result.message, [
        { text: 'Sign in', onPress: () => router.replace('/login') },
      ]);
    } catch (error) {
      const message = getErrorMessage(error, 'Verification failed.');
      setFormError(message);
      showErrorModal('Verification failed', message);
    }
  });

  const onResend = async () => {
    const email = getValues('email');
    if (!email) {
      const message = 'Email is required to resend OTP';
      setFormError(message);
      showErrorModal('Email required', message);
      return;
    }
    setFormError(null);
    try {
      const result = await resend({ email }).unwrap();
      showSuccessModal('OTP sent', result.message);
    } catch (error) {
      const message = getErrorMessage(error, 'Could not resend OTP.');
      setFormError(message);
      showErrorModal('Resend failed', message);
    }
  };

  return (
    <KeyboardAwareScrollScreen centerContent>
      {/* Screen header */}
      <View className="mb-6 items-center gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-container">
          <MaterialCommunityIcons
            name="email-check-outline"
            size={28}
            color={colors.brand.primary}
          />
        </View>
        <View className="items-center gap-1">
          <AppText variant="headline" className="text-center">
            Verify email
          </AppText>
          <AppText variant="caption" className="text-center">
            Enter the 6-digit code sent to your email
          </AppText>
        </View>
      </View>

      {/* OTP form */}
      <View className="gap-4 rounded-lg border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Email"
              leftIcon="email-outline"
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="otp"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="OTP"
              leftIcon="shield-key-outline"
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              returnKeyType="done"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              placeholder="6-digit code"
              onSubmitEditing={onSubmit}
            />
          )}
        />

        {/* Form error message */}
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

        {/* Primary action button */}
        <Button label="Verify" onPress={onSubmit} loading={isLoading} size="lg" />

        {/* Secondary action button */}
        <Button
          label="Resend code"
          variant="outline"
          icon="email-fast-outline"
          onPress={onResend}
          loading={isResending}
        />
      </View>
    </KeyboardAwareScrollScreen>
  );
}
