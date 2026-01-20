/**
 * Reusable Role-Based Tab Layout Component
 * Reduces duplication between officer and leader layouts
 * Automatically wraps all screens with SafeAreaLayout
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface TabConfig {
  name: string;
  title: string;
  iconName: any; // SF Symbol name
  iconSize?: number;
}

interface RoleBasedTabLayoutProps {
  headerTitle: string;
  tabs: TabConfig[];
}

export function RoleBasedTabLayout({ headerTitle, tabs }: RoleBasedTabLayoutProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'light'];

  const screenOptions = {
    tabBarActiveTintColor: colors.tint,
    headerShown: false,
    tabBarButton: HapticTab,
    sceneContainerStyle: {
      backgroundColor: colors.background,
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    tabBarStyle: {
      height: Platform.select({
        ios: 60 + insets.bottom,
        default: 120,
      }),
      paddingBottom: Platform.select({
        ios: insets.bottom,
        default: 16,
      }),
      paddingTop: 8,
    },
    tabBarLabelStyle: {
      fontSize: 11,
      marginTop: -2,
      marginBottom: Platform.select({
        ios: 2,
        default: 2,
      }),
    },
  };

  return (
    <Tabs screenOptions={screenOptions}>
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            headerTitle: tab.name === 'index' ? headerTitle : undefined,
            tabBarIcon: ({ color }) => (
              <IconSymbol size={tab.iconSize ?? 22} name={tab.iconName} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
