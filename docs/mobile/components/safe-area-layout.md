# SafeAreaLayout Component
A reusable safe area layout component that provides consistent safe area handling across all screens in the MANTIS mobile app.

## Overview
`SafeAreaLayout` wraps content with safe area insets and automatically applies theme colors based on the current color scheme.

## Features
- Automatic safe area inset handling
- Theme-aware backgrounds
- Configurable edges
- Custom styling support
- Type-safe props

## Import
```tsx
import { SafeAreaLayout } from "@/components/SafeAreaLayout";
// or
import { SafeAreaLayout } from "@/components";
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
| children | React.ReactNode | Required | Content to render |
| edges | ('top' \| 'right' \| 'bottom' \| 'left')[] | ['top', 'bottom'] | Safe area edges to apply |
| style | ViewStyle | undefined | Additional styles |

## Examples
```tsx
// Only top, left, and right edges (useful for tab bars)
<SafeAreaLayout edges={["top", "left", "right"]}>
  <ScrollView>
    <MyContent />
  </ScrollView>
</SafeAreaLayout>

// With custom padding
<SafeAreaLayout style={{ paddingHorizontal: 16 }}>
  <MyContent />
</SafeAreaLayout>
```

## Migration Guide
Replace ad-hoc `SafeAreaView` usage with `SafeAreaLayout`:
```tsx
import { SafeAreaLayout } from "@/components";

export default function MyScreen() {
  return (
    <SafeAreaLayout edges={["top", "left", "right"]}>
      {/* Content */}
    </SafeAreaLayout>
  );
}
```

## Implementation Notes
- Uses `react-native-safe-area-context`
- Applies current theme background automatically
- Default style `flex: 1`
- Default edges `['top', 'bottom']`

## Adoption Status
Screens updated to use `SafeAreaLayout`:
- Authentication: `mobile/app/(auth)/login.tsx`
- Index/Splash: `mobile/app/index.tsx`
- Officer: `mobile/app/(officer)/index.tsx`, `cases.tsx`, `profile.tsx`, `drafts.tsx`, `map.tsx`
- Team Leader: `mobile/app/(leader)/index.tsx`, `cases.tsx`, `profile.tsx`, `team.tsx`
- Barrel export: `mobile/components/index.ts`

## Testing
Validate on devices with and without notches, both themes, portrait/landscape, and multiple screen ratios.
