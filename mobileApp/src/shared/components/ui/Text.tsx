import { Text, type TextProps } from 'react-native';

import { cn } from '@/src/theme/cn';

type TextVariant =
  | 'display'
  | 'headline'
  | 'title'
  | 'body'
  | 'caption'
  | 'label';

type AppTextProps = TextProps & {
  variant?: TextVariant;
  className?: string;
};

const variants: Record<TextVariant, string> = {
  display: 'font-sans-bold text-display text-foreground dark:text-foreground-dark',
  headline:
    'font-sans-semibold text-headline text-foreground dark:text-foreground-dark',
  title: 'font-sans-semibold text-title text-foreground dark:text-foreground-dark',
  body: 'font-sans text-body text-foreground dark:text-foreground-dark',
  caption: 'font-sans text-caption text-muted dark:text-muted-dark',
  label: 'font-sans-medium text-label text-foreground dark:text-foreground-dark',
};

export function AppText({
  variant = 'body',
  className,
  children,
  ...props
}: AppTextProps) {
  return (
    <Text className={cn(variants[variant], className)} {...props}>
      {children}
    </Text>
  );
}
