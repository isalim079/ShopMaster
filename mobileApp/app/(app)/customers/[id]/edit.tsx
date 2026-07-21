import { useLocalSearchParams } from 'expo-router';

import { CustomerFormScreen } from '@/src/features/customer';

export default function CustomerEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CustomerFormScreen customerId={id} />;
}
