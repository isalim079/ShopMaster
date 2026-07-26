import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useLoginMutation } from '@/src/features/auth/api/authApi';
import {
  loginSchema,
  type LoginFormValues,
} from '@/src/features/auth/schemas/authSchemas';
import { setTokens } from '@/src/features/auth/services/tokenStorage';
import { setSession } from '@/src/features/auth/slices/authSlice';
import {
  Button,
  TextField,
  AppText,
  KeyboardAwareScrollScreen,
} from '@/src/shared/components/ui';
import { useAppDispatch } from '@/src/store/hooks';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { colors } from '@/src/theme/tokens';

export function LoginScreen() {
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await login(values).unwrap();
      if (!result.tokens?.accessToken || !result.tokens?.refreshToken) {
        setFormError('Server did not return tokens. Update auth API for mobile.');
        return;
      }
      await setTokens(result.tokens);
      dispatch(setSession(result.user));
      router.replace('/(app)/(tabs)');
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Login failed. Check your credentials.',
      );
      setFormError(message);
      Alert.alert('Login failed', message);
    }
  });

  return (
    <KeyboardAwareScrollScreen centerContent>
      <View className="mb-8 items-center gap-3">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-container">
          <MaterialCommunityIcons
            name="storefront-outline"
            size={32}
            color={colors.brand.primary}
          />
        </View>
        <View className="items-center gap-1">
          <AppText variant="headline" className="text-center">
            ShopMaster
          </AppText>
          <AppText variant="caption" className="text-center">
            Sign in to manage your shop
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
              returnKeyType="next"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              placeholder="you@shop.com"
            />
          )}
        />

        <View className="gap-1.5">
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <TextField
                label="Password"
                leftIcon="lock-outline"
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
                placeholder="Your password"
                onSubmitEditing={onSubmit}
              />
            )}
          />
          <Link href="/forgot-password" asChild>
            <Pressable
              accessibilityRole="link"
              hitSlop={8}
              className="self-end py-1 active:opacity-70"
            >
              <AppText variant="caption" className="font-sans-medium text-primary">
                Forgot password?
              </AppText>
            </Pressable>
          </Link>
        </View>

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
          label="Sign in"
          icon="login"
          onPress={onSubmit}
          loading={isLoading}
          size="lg"
          className="mt-1"
        />
      </View>

      <View className="mt-5 flex-row flex-wrap items-center justify-center gap-x-1">
        <AppText variant="caption">New to ShopMaster?</AppText>
        <Link href="/register" asChild>
          <Pressable accessibilityRole="link" hitSlop={6} className="active:opacity-70">
            <AppText variant="caption" className="font-sans-semibold text-primary">
              Create account
            </AppText>
          </Pressable>
        </Link>
      </View>
    </KeyboardAwareScrollScreen>
  );
}
