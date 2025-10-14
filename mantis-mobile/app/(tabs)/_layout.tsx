import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';
import { getSyncQueueStats } from '@/lib/api/sync-queue';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { profile } = useAuth();
  const [syncBadge, setSyncBadge] = useState<number>(0);

  // Load sync queue stats
  useEffect(() => {
    const loadSyncStats = async () => {
      try {
        const stats = await getSyncQueueStats();
        setSyncBadge(stats.pending + stats.failed);
      } catch (error) {
        console.error('Failed to load sync stats:', error);
      }
    };

    loadSyncStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadSyncStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Show different tabs based on user role
  const isOfficer = profile?.role === 'officer' || profile?.role === 'agency_admin';
  const isCitizen = profile?.role === 'citizen';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      
      {/* Officer/Admin tabs */}
      {isOfficer && (
        <>
          <Tabs.Screen
            name="create-infringement"
            options={{
              title: 'New',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="sync-queue"
            options={{
              title: 'Sync',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="arrow.clockwise" color={color} />,
              tabBarBadge: syncBadge > 0 ? syncBadge : undefined,
            }}
          />
        </>
      )}

      {/* Common tabs */}
      <Tabs.Screen
        name="infringements"
        options={{
          title: isCitizen ? 'My Infringements' : 'Infringements',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />

      {/* Hide explore screen */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide this screen from tabs
        }}
      />
    </Tabs>
  );
}
