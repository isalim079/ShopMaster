import { useLocalSearchParams } from 'expo-router';

import { WarehouseFormScreen } from '@/src/features/warehouse';

export default function WarehouseEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <WarehouseFormScreen warehouseId={id} />;
}
