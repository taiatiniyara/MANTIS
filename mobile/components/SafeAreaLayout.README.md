# SafeAreaLayout Component

A reusable safe area layout component that provides consistent safe area handling across all screens in the MANTIS mobile app.

## Overview

The `SafeAreaLayout` component wraps content with safe area insets, ensuring proper spacing around device notches, status bars, and navigation bars. It automatically applies the appropriate theme colors based on the current color scheme.

## Features

- ✅ Automatic safe area inset handling
- ✅ Theme-aware background colors
- ✅ Flexible edge configuration
- ✅ Custom styling support
- ✅ Type-safe with TypeScript

## Import

```tsx
import { SafeAreaLayout } from '@/components/SafeAreaLayout';
// or
import { SafeAreaLayout } from '@/components';
```

## Basic Usage

```tsx
export default function MyScreen() {
  return (
    <SafeAreaLayout>
      <ScrollView>
        <ThemedText>Your content here</ThemedText>
      </ScrollView>
    </SafeAreaLayout>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | Required | Content to render inside safe area |
| `edges` | `('top' \| 'right' \| 'bottom' \| 'left')[]` | `['top', 'bottom']` | Which edges to apply safe area insets to |
| `style` | `ViewStyle` | `undefined` | Additional styles to apply |

## Examples

### Default (Top and Bottom Edges)

```tsx
<SafeAreaLayout>
  <ScrollView>
    <MyContent />
  </ScrollView>
</SafeAreaLayout>
```

### Custom Edges

```tsx
// Only top, left, and right edges (useful for screens with tab bars)
<SafeAreaLayout edges={['top', 'left', 'right']}>
  <ScrollView>
    <MyContent />
  </ScrollView>
</SafeAreaLayout>
```

### With Custom Styles

```tsx
<SafeAreaLayout style={{ paddingHorizontal: 16 }}>
  <MyContent />
</SafeAreaLayout>
```

### Full Screen with All Edges

```tsx
<SafeAreaLayout edges={['top', 'bottom', 'left', 'right']}>
  <MyContent />
</SafeAreaLayout>
```

## Common Use Cases

### Dashboard Screen

```tsx
export default function DashboardScreen() {
  return (
    <SafeAreaLayout edges={['top', 'left', 'right']}>
      <ScrollView>
        <ThemedView style={styles.content}>
          {/* Dashboard content */}
        </ThemedView>
      </ScrollView>
    </SafeAreaLayout>
  );
}
```

### Login Screen with Keyboard Avoidance

```tsx
export default function LoginScreen() {
  return (
    <SafeAreaLayout edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView>
          {/* Login form */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaLayout>
  );
}
```

### Profile Screen

```tsx
export default function ProfileScreen() {
  return (
    <SafeAreaLayout>
      <ScrollView>
        <ThemedView style={styles.content}>
          {/* Profile content */}
        </ThemedView>
      </ScrollView>
    </SafeAreaLayout>
  );
}
```

## Migration Guide

### Before (Old Code)

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      edges={['top', 'left', 'right']}
    >
      {/* Content */}
    </SafeAreaView>
  );
}
```

### After (New Code)

```tsx
import { SafeAreaLayout } from '@/components';

export default function MyScreen() {
  return (
    <SafeAreaLayout edges={['top', 'left', 'right']}>
      {/* Content */}
    </SafeAreaLayout>
  );
}
```

## Implementation Details

The component:
1. Automatically applies the current theme's background color
2. Uses `react-native-safe-area-context` under the hood
3. Defaults to `flex: 1` for full-screen layouts
4. Respects system safe areas (notches, status bars, etc.)

## When to Use Different Edges

| Edges | Use Case |
|-------|----------|
| `['top', 'bottom']` | Full-screen content without navigation |
| `['top', 'left', 'right']` | Screens with tab bars (bottom tab navigation) |
| `['top']` | Custom bottom layout/controls |
| `['top', 'right', 'bottom', 'left']` | Fullscreen with all safe areas |

## Notes

- The component automatically handles theme colors, so you don't need to manually set `backgroundColor`
- Safe area insets are device-specific and handled by the OS
- On devices without notches, safe areas will still respect status bars
- The component is built on top of `react-native-safe-area-context`, which must be installed and configured in your app

## Related Components

- `ThemedView` - Theme-aware view component
- `ThemedText` - Theme-aware text component
- `RoleBasedTabLayout` - Tab layout with safe area handling

## Updated Files

The following screens have been updated to use `SafeAreaLayout`:

- [mobile/app/index.tsx](../app/index.tsx) - Splash/index screen
- [mobile/app/(auth)/login.tsx](../app/(auth)/login.tsx) - Login screen
- [mobile/app/(officer)/index.tsx](../app/(officer)/index.tsx) - Officer dashboard
- [mobile/app/(leader)/index.tsx](../app/(leader)/index.tsx) - Team leader dashboard

Other screens that use `ThemedView` directly can be updated as needed to use `SafeAreaLayout` for consistent safe area handling.
