/**
 * Text Component
 * Typography component based on the theme system
 */

import React from 'react';
import { Text as RNText, StyleSheet, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'muted';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
}

export function Text({ variant = 'body', color, style, ...props }: TextProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const textStyles = [
    styles.base,
    getVariantStyles(variant),
    {
      color: color || (variant === 'muted' ? colors.mutedForeground : colors.foreground),
    },
    style,
  ];

  return <RNText style={textStyles} {...props} />;
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
});

function getVariantStyles(variant: TextVariant): TextStyle {
  switch (variant) {
    case 'h1':
      return {
        fontSize: Typography['4xl'].fontSize,
        lineHeight: Typography['4xl'].lineHeight,
        fontWeight: '700',
      };
    case 'h2':
      return {
        fontSize: Typography['3xl'].fontSize,
        lineHeight: Typography['3xl'].lineHeight,
        fontWeight: '600',
      };
    case 'h3':
      return {
        fontSize: Typography['2xl'].fontSize,
        lineHeight: Typography['2xl'].lineHeight,
        fontWeight: '600',
      };
    case 'h4':
      return {
        fontSize: Typography.xl.fontSize,
        lineHeight: Typography.xl.lineHeight,
        fontWeight: '600',
      };
    case 'body':
      return {
        fontSize: Typography.base.fontSize,
        lineHeight: Typography.base.lineHeight,
        fontWeight: '400',
      };
    case 'small':
      return {
        fontSize: Typography.sm.fontSize,
        lineHeight: Typography.sm.lineHeight,
        fontWeight: '400',
      };
    case 'muted':
      return {
        fontSize: Typography.sm.fontSize,
        lineHeight: Typography.sm.lineHeight,
        fontWeight: '400',
      };
  }
}
