import { Redirect } from 'expo-router';

import { AddEmployeeScreen } from '@/src/features/team';
import { isShopAdmin } from '@/src/shared/lib/roles';
import { useAppSelector } from '@/src/store/hooks';

export default function AddEmployeeRoute() {
  const roleSlug = useAppSelector((s) => s.auth.user?.role.slug);

  if (!isShopAdmin(roleSlug)) {
    return <Redirect href="/(app)/(tabs)/more" />;
  }

  return <AddEmployeeScreen />;
}
