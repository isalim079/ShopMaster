import { useLocalSearchParams } from 'expo-router';

import { SaleReturnDetailScreen } from '@/src/features/sale-returns';

export default function SaleReturnDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SaleReturnDetailScreen returnId={String(id)} />;
}
