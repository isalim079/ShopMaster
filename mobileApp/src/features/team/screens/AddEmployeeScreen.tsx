import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useCreateTeamMemberMutation } from '@/src/features/team/api/teamApi';
import {
  createTeamMemberSchema,
  type CreateTeamMemberFormValues,
} from '@/src/features/team/schemas/teamSchemas';
import {
  AppText,
  Button,
  ChipSelect,
  KeyboardAwareScrollScreen,
  TextField,
  useToast,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { showErrorModal, showSuccessModal } from '@/src/shared/utils/modal';
import { colors } from '@/src/theme/tokens';
import { emptyToUndefined } from '@/src/shared/lib/format';

export function AddEmployeeScreen() {
  const { showToast } = useToast();
  const [createMember, { isLoading }] = useCreateTeamMemberMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, reset } =
    useForm<CreateTeamMemberFormValues>({
      resolver: zodResolver(createTeamMemberSchema),
      defaultValues: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        roleSlug: 'EMPLOYEE',
      },
    });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const created = await createMember({
        firstName: values.firstName,
        lastName: emptyToUndefined(values.lastName),
        email: values.email.trim().toLowerCase(),
        phone: emptyToUndefined(values.phone),
        password: values.password,
        roleSlug: values.roleSlug,
      }).unwrap();

      showToast({
        message: `${created.role.name} account created. Login details emailed.`,
        variant: 'success',
      });

      showSuccessModal(
        'Team member added',
        `${created.firstName} can sign in as ${created.role.name}. Credentials were sent to ${created.email}.`,
        [
          {
            text: 'Done',
            onPress: () => router.back(),
          },
          {
            text: 'Add another',
            style: 'cancel',
            onPress: () =>
              reset({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                password: '',
                roleSlug: 'EMPLOYEE',
              }),
          },
        ],
      );
    } catch (error) {
      const message = getErrorMessage(error, 'Could not add team member.');
      setFormError(message);
      showErrorModal('Add failed', message);
    }
  });

  return (
    <KeyboardAwareScrollScreen contentContainerClassName="gap-4">
      {/* Screen header */}
      <View className="mb-1 flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-container">
          <MaterialCommunityIcons
            name="account-plus-outline"
            size={24}
            color={colors.brand.primary}
          />
        </View>
        <View className="flex-1 gap-1">
          <AppText variant="headline">Add team member</AppText>
          <AppText variant="caption">
            Create a manager or employee for your shop. They sign in with the
            email and password you set.
          </AppText>
        </View>
      </View>

      {/* Role picker */}
      <View className="gap-3 rounded-lg border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
        <Controller
          control={control}
          name="roleSlug"
          render={({ field: { onChange, value } }) => (
            <ChipSelect
              label="Role"
              value={value}
              onChange={onChange}
              options={[
                { label: 'Employee', value: 'EMPLOYEE' },
                { label: 'Manager', value: 'MANAGER' },
              ]}
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
              autoComplete="given-name"
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
              autoComplete="family-name"
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Phone (optional)"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              keyboardType="phone-pad"
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextField
              label="Temporary password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              secureTextEntry
              autoComplete="new-password"
              placeholder="They use this to sign in"
            />
          )}
        />

        <AppText variant="caption">
          Managers and employees cannot reset or change passwords themselves.
          Only shop admin can.
        </AppText>

        {formError ? (
          <AppText variant="caption" className="text-danger">
            {formError}
          </AppText>
        ) : null}

        {/* Action button */}
        <Button
          label="Create account"
          icon="account-check-outline"
          onPress={onSubmit}
          loading={isLoading}
          size="lg"
        />
      </View>
    </KeyboardAwareScrollScreen>
  );
}
