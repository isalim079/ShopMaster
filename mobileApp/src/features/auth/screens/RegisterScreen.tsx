import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useRegisterMutation } from '@/src/features/auth/api/authApi';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/src/features/auth/schemas/authSchemas';
import { Button, TextField, AppText } from '@/src/shared/components/ui';

export function RegisterScreen() {
  const [register, { isLoading }] = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, getValues } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      organizationName: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await register({
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
        organizationName: values.organizationName,
      }).unwrap();

      Alert.alert('Check your email', result.message, [
        {
          text: 'Verify',
          onPress: () =>
            router.push({
              pathname: '/(auth)/verify-email',
              params: { email: getValues('email') },
            }),
        },
      ]);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Registration failed.';
      setFormError(message);
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
          <AppText variant="headline">Create account</AppText>
          <AppText variant="caption">
            Register your organization and owner account
          </AppText>
        </View>

        <View className="gap-4">
          <Controller
            control={control}
            name="organizationName"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <TextField
                label="Organization name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <TextField
                label="First name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <TextField
                label="Last name"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
              />
            )}
          />
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
            name="phone"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <TextField
                label="Phone (optional)"
                keyboardType="phone-pad"
                value={value ?? ''}
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

          <Button label="Register" onPress={onSubmit} loading={isLoading} />

          <Link href="/(auth)/login" asChild>
            <Button label="Already have an account" variant="ghost" />
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
