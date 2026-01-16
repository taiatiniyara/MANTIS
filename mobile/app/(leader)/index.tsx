/**
 * MANTIS Mobile - Team Leader Dashboard
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { getTeamStats } from '@/lib/database';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCount } from '@/lib/formatting';

export default function TeamLeaderDashboard() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [stats, setStats] = useState({
    total_infringements: 0,
    today_infringements: 0,
    week_infringements: 0,
    pending_approvals: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.team_id) return;

    try {
      const teamStats = await getTeamStats(user.team_id);
      setStats(teamStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <ThemedText type="title">Team Leader Dashboard</ThemedText>
          <ThemedText type="subtitle" style={styles.userName}>
            {user?.display_name || 'Team Leader'}
          </ThemedText>
          <ThemedText style={styles.teamName}>
            {user?.team?.name || 'Your Team'}
          </ThemedText>
        </View>

        {/* Team Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.tint + '20' }]}>
            <ThemedText style={styles.statValue}>
              {stats.today_infringements}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Today</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.tint + '20' }]}>
            <ThemedText style={styles.statValue}>
              {stats.week_infringements}
            </ThemedText>
            <ThemedText style={styles.statLabel}>This Week</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FF9800' + '40' }]}>
            <ThemedText style={styles.statValue}>
              {stats.pending_approvals}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Pending Approval</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.tint + '20' }]}>
            <ThemedText style={styles.statValue}>
              {stats.total_infringements}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total Cases</ThemedText>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Team Leader Actions
          </ThemedText>
          <View style={styles.actionCard}>
            <ThemedText style={styles.actionEmoji}>✅</ThemedText>
            <ThemedText style={styles.actionTitle}>Review Approvals</ThemedText>
            <ThemedText style={styles.actionDescription}>
              {formatCount(stats.pending_approvals, 'case')} awaiting your review
            </ThemedText>
          </View>
          <View style={styles.actionCard}>
            <ThemedText style={styles.actionEmoji}>👥</ThemedText>
            <ThemedText style={styles.actionTitle}>Team Performance</ThemedText>
            <ThemedText style={styles.actionDescription}>
              View team member statistics and activity
            </ThemedText>
          </View>
          <View style={styles.actionCard}>
            <ThemedText style={styles.actionEmoji}>📊</ThemedText>
            <ThemedText style={styles.actionTitle}>Generate Reports</ThemedText>
            <ThemedText style={styles.actionDescription}>
              Create performance and activity reports
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  userName: {
    marginTop: 4,
  },
  teamName: {
    marginTop: 4,
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  actionCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
});
