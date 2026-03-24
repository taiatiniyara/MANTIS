/**
 * Select Component
 * Based on shadcn/ui select with React Native Picker implementation
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  accessibilityLabel?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  containerStyle,
  labelStyle,
  errorStyle,
  accessibilityLabel,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const derivedA11yLabel = accessibilityLabel ?? label ?? placeholder;

  const selectedOption = options.find(option => option.value === value);

  const triggerStyles: ViewStyle[] = [
    styles.trigger,
    {
      backgroundColor: colorScheme === 'dark'
        ? `${colors.input}33`
        : colors.background,
      borderColor: error ? colors.destructive : isFocused || isOpen ? colors.ring : colors.input,
    },
    ...(disabled ? [styles.disabled] : []),
    Shadows.xs,
  ];

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.foreground }, labelStyle]}>
          {label}
        </Text>
      )}
      <TouchableOpacity
        style={triggerStyles}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessibilityRole="button"
        accessibilityLabel={derivedA11yLabel}
        accessibilityHint={error ? `Error: ${error}` : undefined}
        accessibilityState={{
          disabled,
          expanded: isOpen,
        }}
      >
        <Text
          style={[
            styles.triggerText,
            {
              color: selectedOption ? colors.foreground : colors.mutedForeground,
            },
          ]}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <Text style={[styles.chevron, { color: colors.mutedForeground }]}>▼</Text>
      </TouchableOpacity>
      {error && (
        <Text style={[styles.error, { color: colors.destructive }, errorStyle]}>
          {error}
        </Text>
      )}

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Close options"
        >
          <View
            style={[
              styles.content,
              {
                backgroundColor: colors.popover,
                borderColor: colors.border,
              },
              Shadows.lg,
            ]}
            onStartShouldSetResponder={() => true}
          >
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && {
                      backgroundColor: colors.accent,
                    },
                  ]}
                  onPress={() => handleSelect(item.value)}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: item.value === value }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: item.value === value
                          ? colors.accentForeground
                          : colors.foreground,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  trigger: {
    minHeight: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    flex: 1,
    fontSize: Typography.base.fontSize,
  },
  chevron: {
    fontSize: 10,
    marginLeft: Spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    fontSize: Typography.xs.fontSize,
    marginTop: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    maxHeight: 300,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  optionText: {
    flex: 1,
    fontSize: Typography.sm.fontSize,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
});
