import { StyleSheet, Text, type TextProps } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  color?: string;
  type?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodyMedium' | 'bodySemibold' | 'small' | 'smallMedium' | 'smallSemibold' | 'xs' | 'xsMedium' | 'caption' | 'link';
};

export function ThemedText({
  style,
  color,
  type = 'body',
  ...rest
}: ThemedTextProps) {
  const textColor = color || Colors.text;

  return (
    <Text
      style={[
        { color: textColor },
        type === 'h1' ? styles.h1 : undefined,
        type === 'h2' ? styles.h2 : undefined,
        type === 'h3' ? styles.h3 : undefined,
        type === 'h4' ? styles.h4 : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'bodyMedium' ? styles.bodyMedium : undefined,
        type === 'bodySemibold' ? styles.bodySemibold : undefined,
        type === 'small' ? styles.small : undefined,
        type === 'smallMedium' ? styles.smallMedium : undefined,
        type === 'smallSemibold' ? styles.smallSemibold : undefined,
        type === 'xs' ? styles.xs : undefined,
        type === 'xsMedium' ? styles.xsMedium : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  h1: Typography.h1,
  h2: Typography.h2,
  h3: Typography.h3,
  h4: Typography.h4,
  body: Typography.body,
  bodyMedium: Typography.bodyMedium,
  bodySemibold: Typography.bodySemibold,
  small: Typography.small,
  smallMedium: Typography.smallMedium,
  smallSemibold: Typography.smallSemibold,
  xs: Typography.xs,
  xsMedium: Typography.xsMedium,
  caption: Typography.caption,
  link: {
    ...Typography.body,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
