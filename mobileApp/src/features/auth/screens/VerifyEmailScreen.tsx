import { useState } from 'react';
import { Alert, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from '@/src/features/auth/api/authApi';
import {
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from '@/src/features/auth/schemas/authSchemas';
import { Button, TextField, AppText } from '@/src/shared/components/ui';

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
      Alert.alert('Verified', result.message, [
        { text: 'Sign in', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Verification failed.';
      setFormError(message);
    }
  });

  const onResend = async () => {
    const email = getValues('email');
    if (!email) {
      setFormError('Email is required to resend OTP');
      return;
    }
    try {
      const result = await resend({ email }).unwrap();
      Alert.alert('OTP sent', result.message);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Could not resend OTP.';
      setFormError(message);
    }
  };

  return (
    <View className="flex-1 justify-center gap-4 bg-background px-4 dark:bg-background-dark">
      <View className="mb-4 gap-2">
        <AppText variant="headline">Verify email</AppText>
        <AppText variant="caption">
          Enter the 6-digit code sent to your email
        </AppText>
      </View>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <TextField
            label="Email"
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
            keyboardType="number-pad"
            maxLength={6}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error?.message}
          />
        )}
      />

      {formError ? (
        <AppText className="text-danger" variant="caption">
          {formError}
        </AppText>
      ) : null}

      <Button label="Verify" onPress={onSubmit} loading={isLoading} />
      <Button
        label="Resend code"
        variant="outline"
        onPress={onResend}
        loading={isResending}
      />
    </View>
  );
}
