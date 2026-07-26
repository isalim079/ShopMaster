import { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { cn } from '@/src/theme/cn';
import { colors } from '@/src/theme/tokens';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  className?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
};

const ICON_MUTED = colors.light.muted;
const ICON_FOCUS = colors.brand.primary;
const ICON_ERROR = colors.brand.danger;

export function TextField({
  label,
  error,
  className,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  onFocus,
  onBlur,
  editable = true,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isPassword = secureTextEntry === true;
  const showSecure = isPassword && !passwordVisible;
  const resolvedRightIcon: IconName | undefined = isPassword
    ? passwordVisible
      ? 'eye-off-outline'
      : 'eye-outline'
    : rightIcon;

  const handleRightPress = () => {
    if (isPassword) {
      setPasswordVisible((v) => !v);
      return;
    }
    onRightIconPress?.();
  };

  const iconColor = error ? ICON_ERROR : focused ? ICON_FOCUS : ICON_MUTED;

  return (
    <View className="gap-1.5">
      <Text className="font-sans-medium text-label text-foreground dark:text-foreground-dark">
        {label}
      </Text>
      <View
        className={cn(
          'min-h-12 flex-row items-center gap-2 rounded-md border bg-surface px-3 dark:bg-surface-dark',
          error
            ? 'border-danger'
            : focused
              ? 'border-primary'
              : 'border-border dark:border-border-dark',
          !editable && 'opacity-50',
          className,
        )}
      >
        {leftIcon ? (
          <MaterialCommunityIcons name={leftIcon} size={20} color={iconColor} />
        ) : null}
        <TextInput
          className="flex-1 py-3 font-sans text-body-lg text-foreground dark:text-foreground-dark"
          placeholderTextColor="#94A3B8"
          editable={editable}
          secureTextEntry={showSecure}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {resolvedRightIcon ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isPassword
                ? passwordVisible
                  ? 'Hide password'
                  : 'Show password'
                : undefined
            }
            hitSlop={10}
            disabled={!isPassword && !onRightIconPress}
            onPress={handleRightPress}
            className="p-1 active:opacity-70"
          >
            <MaterialCommunityIcons
              name={resolvedRightIcon}
              size={20}
              color={iconColor}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text className="font-sans text-caption text-danger">{error}</Text>
      ) : null}
    </View>
  );
}
