import { useLocalSearchParams } from 'expo-router';

import { PurchaseReturnDetailScreen } from '@/src/features/purchase-returns';

export default function PurchaseReturnDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PurchaseReturnDetailScreen returnId={String(id)} />;
}
