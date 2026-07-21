import { useLocalSearchParams } from 'expo-router';

import { SaleDetailScreen } from '@/src/features/sales';

export default function SaleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SaleDetailScreen saleId={String(id)} />;
}
