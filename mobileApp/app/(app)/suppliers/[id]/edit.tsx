import { useLocalSearchParams } from 'expo-router';

import { SupplierFormScreen } from '@/src/features/supplier';

export default function SupplierEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SupplierFormScreen supplierId={id} />;
}
