# Mobile UI Components
UI component library for the MANTIS mobile app, aligned with the website's shadcn/ui design system.

## Theme System
Defined in `mobile/constants/theme.ts`:
- Colors: light/dark palettes (oklch)
- Typography: consistent font sizes/line heights
- Spacing: standard scale
- Border Radius: consistent radii
- Shadows: platform-appropriate styles

## Components

### Button
```tsx
import { Button } from "@/components/ui";
<Button variant="default" size="default" onPress={handlePress}>Click me</Button>
```
Variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`
Sizes: `default`, `sm`, `lg`, `icon`

### Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui";
```
Container for grouped content.

### Badge
```tsx
import { Badge } from "@/components/ui";
```
Variants: `default`, `secondary`, `destructive`, `outline`

### Input
```tsx
import { Input } from "@/components/ui";
```
Label + error support.

### Select
```tsx
import { Select } from "@/components/ui";
```
Dropdown component.

### Text
```tsx
import { Text } from "@/components/ui";
```
Variants: `h1`, `h2`, `h3`, `h4`, `body`, `small`, `muted`

### Alert
```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui";
```
Variants: `default`, `destructive`

### Separator
```tsx
import { Separator } from "@/components/ui";
```

## Usage
Import components directly from the UI module:
```tsx
import { Button, Card, Input, Badge } from "@/components/ui";
```

## Customization
Components accept style props:
```tsx
<Button style={{ marginTop: 20 }} textStyle={{ fontSize: 16 }}>
  Custom Button
</Button>
```

## Theme Colors
```tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const colorScheme = useColorScheme();
const colors = Colors[colorScheme ?? "light"];
```
