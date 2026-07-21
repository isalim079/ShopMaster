import { useLocalSearchParams } from 'expo-router';

import { SaleFormScreen } from '@/src/features/sales';

export default function SaleEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SaleFormScreen saleId={String(id)} />;
}
