import { ActivityIndicator, Pressable, Text } from 'react-native';

import { cn } from '@/src/theme/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  testID?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:bg-primary-dark',
  secondary: 'bg-secondary active:opacity-90',
  outline: 'border border-border bg-transparent dark:border-border-dark',
  ghost: 'bg-transparent',
  danger: 'bg-danger active:opacity-90',
};

const textVariantClasses: Record<ButtonVariant, string> = {
  primary: 'text-primary-on',
  secondary: 'text-secondary-on',
  outline: 'text-foreground dark:text-foreground-dark',
  ghost: 'text-primary',
  danger: 'text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3',
  md: 'min-h-12 px-4',
  lg: 'min-h-14 px-6',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      className={cn(
        'flex-row items-center justify-center rounded-lg',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && 'opacity-40',
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#059669' : '#fff'} />
      ) : (
        <Text
          className={cn(
            'font-sans-semibold text-button',
            textVariantClasses[variant],
          )}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
