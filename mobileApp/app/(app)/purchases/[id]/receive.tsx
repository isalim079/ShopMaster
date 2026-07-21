import { useLocalSearchParams } from 'expo-router';

import { PurchaseReceiveScreen } from '@/src/features/purchases';

export default function PurchaseReceive() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PurchaseReceiveScreen purchaseId={String(id)} />;
}
