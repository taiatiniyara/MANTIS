import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function HapticTab(props: BottomTabBarButtonProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const providedStyle = props.style;

  return (
    <PlatformPressable
      {...props}
      hitSlop={8}
      accessibilityRole={props.accessibilityRole ?? 'tab'}
      accessibilityState={props.accessibilityState}
      onPressIn={(ev) => {
        setIsPressed(true);
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
      onPressOut={(ev) => {
        setIsPressed(false);
        props.onPressOut?.(ev);
      }}
      onFocus={(event) => {
        setIsFocused(true);
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        props.onBlur?.(event);
      }}
      style={[
        providedStyle,
        styles.base,
        isPressed ? styles.pressed : null,
        isFocused ? { backgroundColor: colors.accent } : null,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  pressed: {
    opacity: 0.8,
  },
});
