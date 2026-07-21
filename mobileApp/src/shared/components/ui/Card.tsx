import { View, type ViewProps } from 'react-native';

import { cn } from '@/src/theme/cn';

type CardProps = ViewProps & {
  className?: string;
};

export function Card({ className, children, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-lg bg-surface p-4 shadow-sm dark:bg-surface-dark',
        className,
      )}
      style={{ elevation: 2 }}
      {...props}
    >
      {children}
    </View>
  );
}
