import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
} from '@/src/features/auth/api/authApi';
import {
  verifyResetOtpSchema,
  type VerifyResetOtpFormValues,
} from '@/src/features/auth/schemas/authSchemas';
import {
  AppText,
  Button,
  KeyboardAwareScrollScreen,
  TextField,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { colors } from '@/src/theme/tokens';

export function VerifyResetOtpScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const emailParam =
    typeof params.email === 'string' ? params.email.trim().toLowerCase() : '';

  const [verifyResetOtp, { isLoading }] = useVerifyResetOtpMutation();
  const [resend, { isLoading: isResending }] = useForgotPasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(
    emailParam
      ? 'If an account exists for this email, a reset code was sent.'
      : null,
  );

  const { control, handleSubmit, getValues } = useForm<VerifyResetOtpFormValues>({
    resolver: zodResolver(verifyResetOtpSchema),
    defaultValues: {
      email: emailParam,
      otp: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setInfo(null);
    try {
      const result = await verifyResetOtp({
        email: values.email.trim().toLowerCase(),
        otp: values.otp,
      }).unwrap();

      if (!result.resetToken) {
        setFormError('Reset session missing. Request a new code.');
        return;
      }

      router.replace({
        pathname: '/reset-password',
        params: { resetToken: result.resetToken },
      });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Invalid or expired code.'));
    }
  });

  const onResend = async () => {
    const email = getValues('email').trim().toLowerCase();
    if (!email) {
      setFormError('Email is required to resend the code');
      return;
    }
    setFormError(null);
    try {
      await resend({ email }).unwrap();
      setInfo('If an account exists for this email, a new code was sent.');
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not resend code.'));
    }
  };

  return (
    <KeyboardAwareScrollScreen centerContent>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={12}
        onPress={() => router.back()}
        className="mb-4 h-10 w-10 items-center justify-center rounded-full border border-border bg-surface active:opacity-70 dark:border-border-dark dark:bg-surface-dark"
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={22}
          color={colors.brand.primary}
        />
      </Pressable>

      <View className="mb-6 gap-1">
        <AppText variant="headline">Enter reset code</AppText>
        <AppText variant="caption">
          Check your email for the 6-digit code. Codes expire quickly.
        </AppText>
      </View>

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
              autoComplete="email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              editable={!emailParam}
            />
          )}
        />

        <Controller
          control={control}
          name="otp"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Reset code"
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

        {info ? (
          <AppText variant="caption">{info}</AppText>
        ) : null}

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
          label="Verify code"
          icon="check"
          onPress={onSubmit}
          loading={isLoading}
          size="lg"
        />
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
