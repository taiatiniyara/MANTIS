/**
 * Reusable Role-Based Tab Layout Component
 * Reduces duplication between officer and leader layouts
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
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

  const screenOptions = {
    tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
    headerShown: true,
    tabBarButton: HapticTab,
    tabBarStyle: Platform.select({
      ios: {
        position: 'absolute' as const,
      },
      default: {},
    }),
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
              <IconSymbol size={tab.iconSize ?? 28} name={tab.iconName} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
