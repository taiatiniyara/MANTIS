# Mobile UI Components

This directory contains the UI component library for the MANTIS mobile app, based on the website's shadcn/ui design system.

## Theme System

The theme system is defined in [`constants/theme.ts`](../../constants/theme.ts) and includes:

- **Colors**: Light and dark mode color palettes based on oklch color space
- **Typography**: Consistent font sizes and line heights
- **Spacing**: Standard spacing scale (xs, sm, md, lg, xl, etc.)
- **Border Radius**: Consistent border radius values
- **Shadows**: Platform-appropriate shadow styles

## Components

### Button
A versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui';

<Button variant="default" size="default" onPress={handlePress}>
  Click me
</Button>
```

**Variants**: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`
**Sizes**: `default`, `sm`, `lg`, `icon`

### Card
A container component for grouping related content.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Your content */}
  </CardContent>
  <CardFooter>
    {/* Footer content */}
  </CardFooter>
</Card>
```

### Badge
A small status indicator or label.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="default">New</Badge>
```

**Variants**: `default`, `secondary`, `destructive`, `outline`

### Input
A text input with label and error support.

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
/>
```

### Select
A dropdown select component.

```tsx
import { Select } from '@/components/ui';

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
];

<Select
  value={selectedValue}
  onValueChange={setSelectedValue}
  options={options}
  placeholder="Select an option"
/>
```

### Text
A typography component with semantic variants.

```tsx
import { Text } from '@/components/ui';

<Text variant="h1">Heading 1</Text>
<Text variant="body">Body text</Text>
<Text variant="muted">Muted text</Text>
```

**Variants**: `h1`, `h2`, `h3`, `h4`, `body`, `small`, `muted`

### Alert
A component for displaying important messages.

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

**Variants**: `default`, `destructive`

### Separator
A visual divider between content sections.

```tsx
import { Separator } from '@/components/ui';

<Separator orientation="horizontal" />
```

## Usage

Import components from the UI module:

```tsx
import { Button, Card, Input, Badge } from '@/components/ui';
```

All components automatically adapt to the user's color scheme (light/dark mode) using the `useColorScheme` hook.

## Customization

Components accept standard React Native style props for customization:

```tsx
<Button style={{ marginTop: 20 }} textStyle={{ fontSize: 16 }}>
  Custom Button
</Button>
```

## Theme Colors

Access theme colors in your components:

```tsx
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const colorScheme = useColorScheme();
const colors = Colors[colorScheme ?? 'light'];

// Use colors.primary, colors.background, etc.
```
