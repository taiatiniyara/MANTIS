/**
 * Reusable Role-Based Tab Layout Component
 * Reduces duplication between officer and leader layouts
 * Automatically wraps all screens with SafeAreaLayout
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

  const screenOptions: BottomTabNavigationOptions = {
    tabBarActiveTintColor: colors.tint,
    tabBarInactiveTintColor: colors.tabIconDefault,
    tabBarLabelPosition: 'below-icon' as const,
    headerShown: false,
    sceneStyle: {
      backgroundColor: colors.background,
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    tabBarStyle: {
      height: Platform.select({
        ios: 58 + insets.bottom,
        default: 62 + Math.max(insets.bottom, 6),
      }),
      paddingBottom: Platform.select({
        ios: insets.bottom,
        default: Math.max(insets.bottom, 6),
      }),
      paddingTop: 6,
    },
    tabBarItemStyle: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabBarIconStyle: {
      marginBottom: 0,
    },
    tabBarLabelStyle: {
      fontSize: 11,
      marginTop: 0,
      marginBottom: 0,
      textAlign: 'center' as const,
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
          listeners={{
            tabPress: () => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            },
          }}
        />
      ))}
    </Tabs>
  );
}
