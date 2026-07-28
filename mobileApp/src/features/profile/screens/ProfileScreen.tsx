import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  useGetMeQuery,
  useGetMyOrganizationQuery,
  useUpdateMeMutation,
  useUpdateMyOrganizationMutation,
} from '@/src/features/profile/api/profileApi';
import { setSession } from '@/src/features/auth/slices/authSlice';
import {
  AppText,
  Button,
  Card,
  ErrorState,
  KeyboardAwareScrollScreen,
  LoadingState,
  TextField,
} from '@/src/shared/components/ui';
import { getErrorMessage } from '@/src/shared/lib/errors';
import { isStaffRole } from '@/src/shared/lib/roles';
import { showSuccessModal } from '@/src/shared/utils/modal';
import { emptyToUndefined } from '@/src/shared/utils/format';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';

const profileSchema = z.object({
  firstName: z.string().trim().min(2, 'First name is required'),
  lastName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

const orgSchema = z.object({
  name: z.string().trim().min(2, 'Organization name is required'),
});

type ProfileForm = z.infer<typeof profileSchema>;
type OrgForm = z.infer<typeof orgSchema>;

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((s) => s.auth.user);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: me,
    isLoading: loadingMe,
    isError: meError,
    refetch: refetchMe,
    error: meErr,
  } = useGetMeQuery();
  const {
    data: org,
    isLoading: loadingOrg,
    isError: orgError,
    refetch: refetchOrg,
    error: orgErr,
  } = useGetMyOrganizationQuery();

  const [updateMe, { isLoading: savingProfile }] = useUpdateMeMutation();
  const [updateOrg, { isLoading: savingOrg }] =
    useUpdateMyOrganizationMutation();

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  const orgForm = useForm<OrgForm>({
    resolver: zodResolver(orgSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (me) {
      profileForm.reset({
        firstName: me.firstName,
        lastName: me.lastName ?? '',
        phone: me.phone ?? '',
      });
    }
  }, [me, profileForm]);

  useEffect(() => {
    if (org) {
      orgForm.reset({ name: org.name });
    }
  }, [org, orgForm]);

  if ((loadingMe || loadingOrg) && !me && !org) {
    return <LoadingState message="Loading profile…" />;
  }

  if ((meError && !me) || (orgError && !org)) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState
          message={getErrorMessage(meErr ?? orgErr, 'Failed to load profile')}
        />
        <View className="px-4 pb-6">
          <Button
            label="Retry"
            onPress={() => {
              void refetchMe();
              void refetchOrg();
            }}
          />
        </View>
      </View>
    );
  }

  const onSaveProfile = profileForm.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const updated = await updateMe({
        firstName: values.firstName,
        lastName: emptyToUndefined(values.lastName),
        phone: emptyToUndefined(values.phone),
      }).unwrap();

      if (authUser) {
        dispatch(
          setSession({
            ...authUser,
            firstName: updated.firstName,
            lastName: updated.lastName,
            phone: updated.phone,
            email: updated.email,
            status: updated.status,
            isEmailVerified: updated.isEmailVerified,
            role: updated.role,
            updatedAt: updated.updatedAt,
          }),
        );
      }
      showSuccessModal('Saved', 'Profile updated.');
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  });

  const onSaveOrg = orgForm.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const updated = await updateOrg({ name: values.name }).unwrap();
      if (authUser) {
        dispatch(
          setSession({
            ...authUser,
            organization: {
              ...authUser.organization,
              name: updated.name,
              slug: updated.slug,
            },
          }),
        );
      }
      showSuccessModal('Saved', 'Organization updated.');
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  });

  return (
    <KeyboardAwareScrollScreen contentContainerClassName="gap-4">
        <View className="gap-1">
          <AppText variant="title">Profile</AppText>
            <AppText variant="caption">
              {me?.email ?? authUser?.email ?? ''}
            </AppText>
            <AppText variant="caption" className="font-sans-semibold text-primary">
              Role ·{' '}
              {me?.role?.name ||
                authUser?.role?.name ||
                me?.role?.slug ||
                authUser?.role?.slug ||
                '—'}
            </AppText>
            {isStaffRole(me?.role?.slug ?? authUser?.role?.slug) ? (
              <AppText variant="caption">
                Password changes and resets are managed by your shop admin.
              </AppText>
            ) : null}
        </View>

          {formError ? (
            <AppText variant="caption" className="text-danger">
              {formError}
            </AppText>
          ) : null}

          <Card className="gap-3">
            <AppText variant="title">Your details</AppText>
            <Controller
              control={profileForm.control}
              name="firstName"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <TextField
                  label="First name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={profileForm.control}
              name="lastName"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <TextField
                  label="Last name"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={profileForm.control}
              name="phone"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <TextField
                  label="Phone"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Button
              label="Save profile"
              onPress={onSaveProfile}
              loading={savingProfile}
            />
          </Card>

          <Card className="gap-3">
            <AppText variant="title">Organization</AppText>
            <AppText variant="caption">
              Currency {org?.currency ?? '—'} · {org?.timezone ?? '—'}
            </AppText>
            <Controller
              control={orgForm.control}
              name="name"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <TextField
                  label="Organization name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Button
              label="Save organization"
              onPress={onSaveOrg}
              loading={savingOrg}
            />
          </Card>
    </KeyboardAwareScrollScreen>
  );
}
