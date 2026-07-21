import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useLoginMutation } from '@/src/features/auth/api/authApi';
import {
  loginSchema,
  type LoginFormValues,
} from '@/src/features/auth/schemas/authSchemas';
import { setTokens } from '@/src/features/auth/services/tokenStorage';
import { setSession } from '@/src/features/auth/slices/authSlice';
import { Button, TextField, AppText } from '@/src/shared/components/ui';
import { useAppDispatch } from '@/src/store/hooks';

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
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Login failed. Check your credentials.';
      setFormError(message);
      Alert.alert('Login failed', message);
    }
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-background-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-4 py-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8 gap-2">
          <AppText variant="headline">ShopMaster</AppText>
          <AppText variant="caption">Sign in to manage your shop</AppText>
        </View>

        <View className="gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <TextField
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <TextField
                label="Password"
                secureTextEntry
                autoComplete="password"
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

          <Button label="Sign in" onPress={onSubmit} loading={isLoading} />

          <Link href="/(auth)/register" asChild>
            <Button label="Create account" variant="ghost" />
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
