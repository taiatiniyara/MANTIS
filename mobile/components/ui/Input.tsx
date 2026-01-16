/**
 * Input Component
 * Based on shadcn/ui input with React Native implementation
 */

import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  labelStyle,
  errorStyle,
  style,
  editable = true,
  ...props
}: InputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const inputWrapperStyles = [
    styles.inputWrapper,
    Shadows.xs,
  ];

  const inputStyles: TextStyle[] = [
    styles.input,
    {
      backgroundColor: colorScheme === 'dark' 
        ? `${colors.input}33` // 20% opacity for dark mode
        : colors.background,
      borderColor: error ? colors.destructive : colors.input,
      color: colors.foreground,
    },
    ...(leftIcon ? [styles.inputWithLeftIcon] : []),
    ...(rightIcon ? [styles.inputWithRightIcon] : []),
    ...(!editable ? [styles.inputDisabled] : []),
    ...(style ? [style as TextStyle] : []),
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.foreground }, labelStyle]}>
          {label}
        </Text>
      )}
      <View style={inputWrapperStyles}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>{leftIcon}</View>
        )}
        <TextInput
          style={inputStyles}
          placeholderTextColor={colors.mutedForeground}
          editable={editable}
          {...props}
        />
        {rightIcon && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>
      {error && (
        <Text
          style={[
            styles.error,
            { color: colors.destructive },
            errorStyle,
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.sm.fontSize,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: 36,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.base.fontSize,
  },
  inputWithLeftIcon: {
    paddingLeft: 40,
  },
  inputWithRightIcon: {
    paddingRight: 40,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  leftIconContainer: {
    position: 'absolute',
    left: Spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
    zIndex: 1,
  },
  rightIconContainer: {
    position: 'absolute',
    right: Spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
    zIndex: 1,
  },
  error: {
    fontSize: Typography.xs.fontSize,
    marginTop: 2,
  },
});
