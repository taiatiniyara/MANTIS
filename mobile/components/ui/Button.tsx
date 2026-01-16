/**
 * Button Component
 * Based on shadcn/ui button with React Native implementation
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
  type TouchableOpacityProps,
} from 'react-native';
import { Colors, BorderRadius, Typography, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({
  variant = 'default',
  size = 'default',
  children,
  loading = false,
  disabled,
  icon,
  iconPosition = 'left',
  style,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const buttonStyles: ViewStyle[] = [
    styles.base,
    getVariantStyles(variant, colors),
    getSizeStyles(size),
    ...((disabled || loading) ? [styles.disabled] : []),
    ...(style ? [style as ViewStyle] : []),
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    getVariantTextStyles(variant, colors),
    getSizeTextStyles(size),
    ...((disabled || loading) ? [styles.disabledText] : []),
  ];

  const content = (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={getLoaderColor(variant, colors)}
          style={styles.loader}
        />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <>{icon}</>
      )}
      {typeof children === 'string' ? (
        <Text style={textStyles}>{children}</Text>
      ) : (
        children
      )}
      {!loading && icon && iconPosition === 'right' && (
        <>{icon}</>
      )}
    </>
  );

  if (variant === 'link') {
    return (
      <TouchableOpacity
        disabled={disabled || loading}
        style={buttonStyles}
        activeOpacity={0.7}
        {...props}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      style={buttonStyles}
      activeOpacity={0.8}
      {...props}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
  loader: {
    marginRight: Spacing.sm,
  },
});

function getVariantStyles(variant: ButtonVariant, colors: typeof Colors.light): ViewStyle {
  switch (variant) {
    case 'default':
      return {
        backgroundColor: colors.primary,
      };
    case 'outline':
      return {
        backgroundColor: colors.background,
        borderColor: colors.border,
      };
    case 'secondary':
      return {
        backgroundColor: colors.secondary,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderWidth: 0,
      };
    case 'destructive':
      return {
        backgroundColor: `${colors.destructive}1A`, // 10% opacity
      };
    case 'link':
      return {
        backgroundColor: 'transparent',
        borderWidth: 0,
      };
  }
}

function getVariantTextStyles(variant: ButtonVariant, colors: typeof Colors.light): TextStyle {
  switch (variant) {
    case 'default':
      return {
        color: colors.primaryForeground,
      };
    case 'outline':
      return {
        color: colors.foreground,
      };
    case 'secondary':
      return {
        color: colors.secondaryForeground,
      };
    case 'ghost':
      return {
        color: colors.foreground,
      };
    case 'destructive':
      return {
        color: colors.destructive,
      };
    case 'link':
      return {
        color: colors.primary,
        textDecorationLine: 'underline',
      };
  }
}

function getSizeStyles(size: ButtonSize): ViewStyle {
  switch (size) {
    case 'default':
      return {
        height: 36,
        paddingHorizontal: Spacing.md,
        gap: Spacing.xs,
      };
    case 'sm':
      return {
        height: 32,
        paddingHorizontal: Spacing.sm,
        gap: Spacing.xs,
      };
    case 'lg':
      return {
        height: 40,
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
      };
    case 'icon':
      return {
        width: 36,
        height: 36,
        paddingHorizontal: 0,
      };
  }
}

function getSizeTextStyles(size: ButtonSize): TextStyle {
  switch (size) {
    case 'default':
      return {
        fontSize: Typography.sm.fontSize,
        lineHeight: Typography.sm.lineHeight,
      };
    case 'sm':
      return {
        fontSize: Typography.sm.fontSize,
        lineHeight: Typography.sm.lineHeight,
      };
    case 'lg':
      return {
        fontSize: Typography.base.fontSize,
        lineHeight: Typography.base.lineHeight,
      };
    case 'icon':
      return {
        fontSize: 0,
      };
  }
}

function getLoaderColor(variant: ButtonVariant, colors: typeof Colors.light): string {
  switch (variant) {
    case 'default':
      return colors.primaryForeground;
    case 'destructive':
      return colors.destructive;
    default:
      return colors.foreground;
  }
}
