/**
 * MANTIS Mobile - Team Leader Dashboard
 */

import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DashboardContainer, SectionHeader, StatCard, StatsGrid, WelcomeSection } from '@/components/DashboardComponents';
import { useAuth } from '@/contexts/AuthContext';
import { getTeamStats } from '@/lib/database';
import { formatCount } from '@/lib/formatting';
import { queryKeys } from '@/lib/queryKeys';

export default function TeamLeaderDashboard() {
  const { user } = useAuth();

  const {
    data: stats = {
      total_infringements: 0,
      today_infringements: 0,
      week_infringements: 0,
      pending_approvals: 0,
    },
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.teamStats(user?.team_id),
    queryFn: async () => {
      if (!user?.team_id) return {
        total_infringements: 0,
        today_infringements: 0,
        week_infringements: 0,
        pending_approvals: 0,
      };
      return getTeamStats(user.team_id);
    },
    enabled: Boolean(user?.team_id),
    staleTime: 1000 * 60 * 2,
  });

  const onRefresh = () => {
    refetch();
  };

  return (
    <ScrollView
      style={styles.container}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} />}
    >
      <DashboardContainer>
        <WelcomeSection
          title="Team Leader Dashboard"
          userName={user?.display_name || 'Team Leader'}
          subtitle={user?.team?.name || 'Your Team'}
        />

        <StatsGrid>
          <StatCard value={stats.today_infringements} label="Today" />
          <StatCard value={stats.week_infringements} label="This Week" />
          <StatCard
            value={stats.pending_approvals}
            label="Pending Approval"
            backgroundColor="#FF980040"
          />
          <StatCard value={stats.total_infringements} label="Total Cases" />
        </StatsGrid>

        <ThemedView style={styles.card}>
          <SectionHeader title="Team Leader Actions" />
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
        </ThemedView>
      </DashboardContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
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
