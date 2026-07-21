import { useLocalSearchParams } from 'expo-router';

import { ProductFormScreen } from '@/src/features/products';

export default function ProductEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProductFormScreen productId={String(id)} />;
}
