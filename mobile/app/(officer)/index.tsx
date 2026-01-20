/**
 * MANTIS Mobile - Officer Dashboard
 */

import React, { useMemo } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SessionStatus } from '@/components/SessionStatus';
import { SyncStatus } from '@/components/SyncStatus';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DashboardContainer, SectionHeader, StatCard, StatsGrid } from '@/components/DashboardComponents';
import { Button } from '@/components/ui/Button';
import { CaseCard } from '@/components/CaseCard';
import { EmptyState } from '@/components/EmptyState';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getInfringements } from '@/lib/database';
import { Infringement } from '@/lib/types';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    data: recentCases = [],
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ['infringements', 'officer', user?.id, 5],
    queryFn: async () => {
      if (!user?.id) return [] as Infringement[];
      const { data, error: queryError } = await getInfringements({ officer_id: user.id, limit: 5 });

      if (queryError) {
        throw new Error(queryError.message || 'Failed to load infringements');
      }

      return data ?? [];
    },
    enabled: Boolean(user?.id),
  });

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return {
      today: recentCases.filter(c => new Date(c.issued_at) >= today).length,
      week: recentCases.filter(c => new Date(c.issued_at) >= weekAgo).length,
      pending: recentCases.filter(c => c.status === 'pending').length,
      total: recentCases.length,
    };
  }, [recentCases]);

  const onRefresh = () => {
    refetch();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
    >
      <DashboardContainer>
        <ThemedView style={[styles.card, styles.heroCard]}>
          <View style={styles.heroHeader}>
            <View>
              <ThemedText type="subtitle" style={styles.userName}>
                {user?.display_name || 'Officer'}
              </ThemedText>
              <ThemedText style={styles.agencyName}>
                {user?.agency?.name || 'Your agency'}
              </ThemedText>
            </View>
            <SessionStatus />
          </View>
          <SyncStatus autoSync />
        </ThemedView>

        <StatsGrid>
          <StatCard value={stats.today} label="Today" />
          <StatCard value={stats.week} label="This Week" />
          <StatCard value={stats.pending} label="Pending" backgroundColor="#F39C1233" />
          <StatCard value={stats.total} label="Total" backgroundColor={colors.tint + '33'} />
        </StatsGrid>

        <ThemedView style={styles.card}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.actionsContainer}>
            <Button style={styles.actionButton} onPress={() => router.push('/(officer)/create')}>
              + New
            </Button>
            <Button
              variant="secondary"
              style={styles.actionButton}
              onPress={() => router.push('/(officer)/map')}
            >
              Open Map
            </Button>
          </View>
        </ThemedView>

        <ThemedView style={styles.card}>
          <SectionHeader
            title="Recent Cases"
            action={
              <TouchableOpacity onPress={() => router.push('/(officer)/cases')}>
                <ThemedText style={[styles.link, { color: colors.tint }]}>View All</ThemedText>
              </TouchableOpacity>
            }
          />

          {isLoading ? (
            <ThemedText style={styles.emptyText}>Loading...</ThemedText>
          ) : error ? (
            <ThemedText style={styles.emptyText}>Couldn&apos;t load infringements.</ThemedText>
          ) : recentCases.length === 0 ? (
            <EmptyState
              title="No infringements yet"
              message="Tap New Infringement to create your first case"
            />
          ) : (
            <View style={styles.casesList}>
              {recentCases.map(infringement => (
                <CaseCard
                  key={infringement.id}
                  code={infringement.offence_code}
                  amount={infringement.fine_amount}
                  status={infringement.status}
                  issuedAt={infringement.issued_at}
                />
              ))}
            </View>
          )}
        </ThemedView>
      </DashboardContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    borderRadius: 14,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  heroCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '700',
  },
  agencyName: {
    marginTop: 4,
    opacity: 0.7,
  },
  link: { fontSize: 14 },
  actionsContainer: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1 },
  casesList: { gap: 12 },
  emptyText: { fontSize: 16, textAlign: 'center', marginBottom: 8 },
});
