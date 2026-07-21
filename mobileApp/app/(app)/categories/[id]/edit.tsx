import { useLocalSearchParams } from 'expo-router';

import { CategoryFormScreen } from '@/src/features/category';

export default function CategoryEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CategoryFormScreen categoryId={id} />;
}
