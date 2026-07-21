import { useLocalSearchParams } from 'expo-router';

import { BrandFormScreen } from '@/src/features/brand';

export default function BrandEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BrandFormScreen brandId={id} />;
}
