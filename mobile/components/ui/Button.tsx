/**
 * Button Component
 * Based on shadcn/ui button with React Native implementation
 */

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
  type PressableProps,
} from 'react-native';
import { Colors, BorderRadius, Typography, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends PressableProps {
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
  const [isFocused, setIsFocused] = React.useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const disabledState = disabled || loading;

  const derivedA11yLabel = React.useMemo(() => {
    if (typeof props.accessibilityLabel === 'string') {
      return props.accessibilityLabel;
    }
    if (typeof children === 'string') {
      return children;
    }
    return 'Button';
  }, [children, props.accessibilityLabel]);

  const textStyles: TextStyle[] = [
    styles.text,
    getVariantTextStyles(variant, colors),
    getSizeTextStyles(size),
    ...(disabledState ? [styles.disabledText] : []),
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

  return (
    <Pressable
      {...props}
      onFocus={(event) => {
        setIsFocused(true);
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        props.onBlur?.(event);
      }}
      disabled={disabledState}
      accessibilityRole={props.accessibilityRole ?? 'button'}
      accessibilityLabel={derivedA11yLabel}
      accessibilityState={{
        ...props.accessibilityState,
        disabled: !!disabledState,
        busy: !!loading,
      }}
      style={({ pressed }) => [
        styles.base,
        getVariantStyles(variant, colors),
        getSizeStyles(size),
        pressed && !disabledState ? styles.pressed : null,
        isFocused ? { borderColor: colors.ring } : null,
        disabledState ? styles.disabled : null,
        style as ViewStyle,
      ]}
    >
      {content}
    </Pressable>
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
    minHeight: 44,
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
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
        backgroundColor: colors.destructive,
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
        color: colors.destructiveForeground,
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
        height: 44,
        paddingHorizontal: Spacing.md,
        gap: Spacing.xs,
      };
    case 'sm':
      return {
        height: 44,
        paddingHorizontal: Spacing.md,
        gap: Spacing.xs,
      };
    case 'lg':
      return {
        height: 48,
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
      };
    case 'icon':
      return {
        width: 44,
        height: 44,
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
