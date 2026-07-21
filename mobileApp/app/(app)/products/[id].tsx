import { useLocalSearchParams } from 'expo-router';

import { ProductDetailScreen } from '@/src/features/products';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProductDetailScreen productId={String(id)} />;
}
