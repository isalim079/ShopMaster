import { useLocalSearchParams } from 'expo-router';

import { PurchaseDetailScreen } from '@/src/features/purchases';

export default function PurchaseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PurchaseDetailScreen purchaseId={String(id)} />;
}
