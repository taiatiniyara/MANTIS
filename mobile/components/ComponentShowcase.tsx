/**
 * Example Component
 * Demonstrates the usage of the UI component library
 */

import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Input,
  Select,
  Text,
  Alert,
  AlertTitle,
  AlertDescription,
  Separator,
} from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function ComponentShowcase() {
  const [email, setEmail] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const selectOptions = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="h1">Component Showcase</Text>
      <Text variant="muted">Examples of the UI component library</Text>

      <Separator />

      {/* Buttons Section */}
      <View style={styles.section}>
        <Text variant="h3">Buttons</Text>
        <View style={styles.buttonGroup}>
          <Button variant="default" onPress={() => console.log('Default')}>
            Default
          </Button>
          <Button variant="outline" onPress={() => console.log('Outline')}>
            Outline
          </Button>
          <Button variant="secondary" onPress={() => console.log('Secondary')}>
            Secondary
          </Button>
          <Button variant="ghost" onPress={() => console.log('Ghost')}>
            Ghost
          </Button>
          <Button variant="destructive" onPress={() => console.log('Destructive')}>
            Destructive
          </Button>
        </View>
        
        <Text variant="h4">Button Sizes</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </View>

        <Text variant="h4">Loading State</Text>
        <Button loading>Loading...</Button>
      </View>

      <Separator />

      {/* Badges Section */}
      <View style={styles.section}>
        <Text variant="h3">Badges</Text>
        <View style={styles.badgeGroup}>
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </View>
      </View>

      <Separator />

      {/* Inputs Section */}
      <View style={styles.section}>
        <Text variant="h3">Inputs</Text>
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
        />
        <Input
          label="Disabled"
          placeholder="Disabled input"
          editable={false}
        />
        <Input
          label="With Error"
          placeholder="Enter something"
          error="This field is required"
        />
      </View>

      <Separator />

      {/* Select Section */}
      <View style={styles.section}>
        <Text variant="h3">Select</Text>
        <Select
          label="Choose an option"
          value={selectedValue}
          onValueChange={setSelectedValue}
          options={selectOptions}
          placeholder="Select an option"
        />
      </View>

      <Separator />

      {/* Cards Section */}
      <View style={styles.section}>
        <Text variant="h3">Cards</Text>
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>
              This is a card description that provides additional context.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text>
              This is the main content of the card. You can put any content here.
            </Text>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
            <Button size="sm">Confirm</Button>
          </CardFooter>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Small Card</CardTitle>
          </CardHeader>
          <CardContent>
            <Text variant="small">This is a smaller card variant.</Text>
          </CardContent>
        </Card>
      </View>

      <Separator />

      {/* Alerts Section */}
      <View style={styles.section}>
        <Text variant="h3">Alerts</Text>
        <Alert>
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            This is a default alert with important information.
          </AlertDescription>
        </Alert>

        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Something went wrong. Please try again.
          </AlertDescription>
        </Alert>
      </View>

      <Separator />

      {/* Typography Section */}
      <View style={styles.section}>
        <Text variant="h3">Typography</Text>
        <Text variant="h1">Heading 1</Text>
        <Text variant="h2">Heading 2</Text>
        <Text variant="h3">Heading 3</Text>
        <Text variant="h4">Heading 4</Text>
        <Text variant="body">Body text - Regular paragraph text</Text>
        <Text variant="small">Small text - For captions and labels</Text>
        <Text variant="muted">Muted text - For secondary information</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.md,
  },
  buttonGroup: {
    gap: Spacing.sm,
  },
  badgeGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
