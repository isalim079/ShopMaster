import { useLocalSearchParams } from 'expo-router';

import { ExpenseFormScreen } from '@/src/features/expenses';

export default function ExpenseEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ExpenseFormScreen expenseId={String(id)} />;
}
