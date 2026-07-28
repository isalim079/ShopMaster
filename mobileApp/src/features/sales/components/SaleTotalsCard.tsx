import { View } from 'react-native';

import { AppText } from '@/src/shared/components/ui';
import { formatMoney } from '@/src/shared/lib/format';
import { cn } from '@/src/theme/cn';
import type { SaleTotalsBreakdown } from '@/src/features/sales/lib/saleTotals';

type SaleTotalsCardProps = {
  totals: SaleTotalsBreakdown;
  className?: string;
};

function Row({
  label,
  value,
  muted,
  emphasize,
}: {
  label: string;
  value: string;
  muted?: boolean;
  emphasize?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <AppText
        variant={emphasize ? 'body' : 'caption'}
        className={cn(
          emphasize && 'font-sans-semibold',
          muted && 'text-muted dark:text-muted-dark',
        )}
      >
        {label}
      </AppText>
      <AppText
        variant={emphasize ? 'body' : 'caption'}
        className={cn(
          emphasize && 'font-sans-bold text-primary',
          muted && 'text-muted dark:text-muted-dark',
        )}
      >
        {value}
      </AppText>
    </View>
  );
}

export function SaleTotalsCard({ totals, className }: SaleTotalsCardProps) {
  return (
    <View
      className={cn(
        'gap-1 rounded-lg border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark',
        className,
      )}
    >
      {/* Summary header */}
      <AppText variant="title" className="mb-1">
        Order summary
      </AppText>

      <Row label="Items (gross)" value={formatMoney(totals.itemsGross)} muted />
      {totals.itemsDiscount > 0 ? (
        <Row
          label="Line discounts"
          value={`−${formatMoney(totals.itemsDiscount)}`}
          muted
        />
      ) : null}
      <Row label="Subtotal" value={formatMoney(totals.subtotal)} />
      <Row label="Tax" value={formatMoney(totals.taxAmount)} />
      {totals.orderDiscount > 0 ? (
        <Row
          label="Discount"
          value={`−${formatMoney(totals.orderDiscount)}`}
        />
      ) : null}

      {/* Divider + grand total */}
      <View className="my-2 border-t border-divider dark:border-border-dark" />
      <Row
        label="Total"
        value={formatMoney(totals.total)}
        emphasize
      />
    </View>
  );
}
