import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { CountryCode } from 'react-native-country-picker-modal';

import { useRegisterMutation } from '@/src/features/auth/api/authApi';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/src/features/auth/schemas/authSchemas';
import {
  AppText,
  Button,
  KeyboardAwareScrollScreen,
  PhoneField,
  TextField,
} from '@/src/shared/components/ui';
import { showSuccessModal } from '@/src/shared/utils/modal';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { colors } from '@/src/theme/tokens';

export function RegisterScreen() {
  const [register, { isLoading }] = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, getValues, setValue } =
    useForm<RegisterFormValues>({
      resolver: zodResolver(registerSchema),
      defaultValues: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNational: '',
        phoneCountry: 'BD',
        phone: undefined,
        password: '',
        organizationName: '',
      },
    });

  const phoneCountry = (useWatch({ control, name: 'phoneCountry' }) ??
    'BD') as CountryCode;
  const phoneNational = useWatch({ control, name: 'phoneNational' }) ?? '';

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await register({
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        email: values.email.trim().toLowerCase(),
        phone: values.phone || undefined,
        password: values.password,
        organizationName: values.organizationName,
      }).unwrap();

      showSuccessModal('Check your email', result.message, [
        {
          text: 'Verify email',
          onPress: () =>
            router.push({
              pathname: '/(auth)/verify-email',
              params: { email: getValues('email').trim().toLowerCase() },
            }),
        },
      ]);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Registration failed.'));
    }
  });

  return (
    <KeyboardAwareScrollScreen>
      {/* Back navigation */}
      <Link href="/(auth)/login" asChild>
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

      {/* Screen header */}
      <View className="mb-6 flex-row items-center gap-4">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-container">
          <MaterialCommunityIcons
            name="account-plus-outline"
            size={28}
            color={colors.brand.primary}
          />
        </View>
        <View className="flex-1 gap-1">
          <AppText variant="headline">Create account</AppText>
          <AppText variant="caption">
            Register your organization and owner account
          </AppText>
        </View>
      </View>

      {/* Registration form */}
      <View className="gap-4 rounded-lg border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark">
        <Controller
          control={control}
          name="organizationName"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Organization name"
              leftIcon="domain"
              autoComplete="organization"
              textContentType="organizationName"
              returnKeyType="next"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              placeholder="Acme Retail"
            />
          )}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="firstName"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextField
                  label="First name"
                  autoComplete="given-name"
                  textContentType="givenName"
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  placeholder="Alex"
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="lastName"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextField
                  label="Last name"
                  autoComplete="family-name"
                  textContentType="familyName"
                  returnKeyType="next"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  placeholder="Rivera"
                />
              )}
            />
          </View>
        </View>

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

        <Controller
          control={control}
          name="phoneNational"
          render={({ fieldState: { error } }) => (
            <PhoneField
              countryCode={phoneCountry}
              value={phoneNational}
              onCountryChange={(code) => {
                setValue('phoneCountry', code, { shouldValidate: true });
              }}
              onChangeNational={(national) => {
                setValue('phoneNational', national, { shouldValidate: true });
              }}
              onChangeE164={(e164) => {
                setValue('phone', e164, { shouldValidate: true });
              }}
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
              leftIcon="lock-outline"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              placeholder="At least 8 characters"
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
        <Button
          label="Register"
          icon="check-circle-outline"
          onPress={onSubmit}
          loading={isLoading}
          size="lg"
        />
      </View>

      {/* Footer link */}
      <View className="mt-5 flex-row flex-wrap items-center justify-center gap-x-1 pb-2">
        <AppText variant="caption">Already have an account?</AppText>
        <Link href="/login" asChild>
          <Pressable accessibilityRole="link" hitSlop={6} className="active:opacity-70">
            <AppText variant="caption" className="font-sans-semibold text-primary">
              Sign in
            </AppText>
          </Pressable>
        </Link>
      </View>
    </KeyboardAwareScrollScreen>
  );
}
