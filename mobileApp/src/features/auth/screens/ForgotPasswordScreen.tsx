import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useForgotPasswordMutation } from '@/src/features/auth/api/authApi';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/src/features/auth/schemas/authSchemas';
import {
  AppText,
  Button,
  KeyboardAwareScrollScreen,
  TextField,
  useToast,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { colors } from '@/src/theme/tokens';

function isUserNotFound(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as {
    status?: number;
    data?: { message?: string; details?: { code?: string } };
  };
  if (err.data?.details?.code === 'USER_NOT_FOUND') return true;
  if (err.status === 404) return true;
  const message = err.data?.message?.toLowerCase() ?? '';
  return message.includes('user not found');
}

export function ForgotPasswordScreen() {
  const { showToast } = useToast();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const email = values.email.trim().toLowerCase();
    try {
      const result = await forgotPassword({ email }).unwrap();
      showToast({
        message: result.message || 'Password reset code sent to your email.',
        variant: 'success',
      });
      router.push({
        pathname: '/verify-reset-otp',
        params: { email },
      });
    } catch (error) {
      if (isUserNotFound(error)) {
        showToast({
          message: 'User not found.',
          variant: 'error',
        });
        return;
      }
      setFormError(
        getErrorMessage(error, 'Could not send reset code. Try again.'),
      );
    }
  });

  return (
    <KeyboardAwareScrollScreen centerContent>
      <Link href="/login" asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to sign in"
          hitSlop={12}
          className="mb-4 h-10 w-10 items-center justify-center rounded-full border border-border bg-surface active:opacity-70 dark:border-border-dark dark:bg-surface-dark"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color={colors.brand.primary}
          />
        </Pressable>
      </Link>

      <View className="mb-6 items-center gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-container">
          <MaterialCommunityIcons
            name="lock-reset"
            size={28}
            color={colors.brand.primary}
          />
        </View>
        <View className="items-center gap-1">
          <AppText variant="headline" className="text-center">
            Forgot password
          </AppText>
          <AppText variant="caption" className="text-center">
            Enter your account email. We will verify it and send a 6-digit reset
            code.
          </AppText>
        </View>
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
              textContentType="emailAddress"
              returnKeyType="send"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              placeholder="you@shop.com"
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
          label="Send reset code"
          icon="email-fast-outline"
          onPress={onSubmit}
          loading={isLoading}
          size="lg"
        />
      </View>
    </KeyboardAwareScrollScreen>
  );
}
