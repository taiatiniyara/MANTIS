/**
 * MANTIS Mobile - Officer Dashboard
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SyncStatus } from '@/components/SyncStatus';
import { useAuth } from '@/contexts/AuthContext';
import { getInfringements } from '@/lib/database';
import { Infringement } from '@/lib/types';
import { formatDate, formatCurrency, formatInfringementStatus } from '@/lib/formatting';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [recentCases, setRecentCases] = useState<Infringement[]>([]);
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    pending: 0,
    total: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    try {
      const { data: cases } = await getInfringements({
        officer_id: user.id,
        limit: 5,
      });

      if (cases) {
        setRecentCases(cases);

        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        setStats({
          today: cases.filter(c => new Date(c.issued_at) >= today).length,
          week: cases.filter(c => new Date(c.issued_at) >= weekAgo).length,
          pending: cases.filter(c => c.status === 'pending').length,
          total: cases.length,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
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
          <ThemedText type="title">Welcome back,</ThemedText>
          <ThemedText type="subtitle" style={styles.userName}>
            {user?.display_name || 'Officer'}
          </ThemedText>
          <ThemedText style={styles.agencyName}>
            {user?.agency?.name}
          </ThemedText>
        </View>

        {/* Sync Status */}
        <SyncStatus autoSync={true} />

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.tint + '20' }]}>
            <ThemedText style={styles.statValue}>{stats.today}</ThemedText>
            <ThemedText style={styles.statLabel}>Today</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.tint + '20' }]}>
            <ThemedText style={styles.statValue}>{stats.week}</ThemedText>
            <ThemedText style={styles.statLabel}>This Week</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.tint + '20' }]}>
            <ThemedText style={styles.statValue}>{stats.pending}</ThemedText>
            <ThemedText style={styles.statLabel}>Pending</ThemedText>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.tint }]}
              onPress={() => router.push('/(officer)/create')}
            >
              <ThemedText style={styles.actionButtonText}>
                ➕ New Infringement
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.tint }]}
              onPress={() => router.push('/(officer)/map')}
            >
              <ThemedText style={styles.actionButtonText}>
                🗺️ Open Map
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Cases */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Recent Cases
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/(officer)/cases')}>
              <ThemedText style={[styles.link, { color: colors.tint }]}>
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ThemedText style={styles.emptyText}>Loading...</ThemedText>
          ) : recentCases.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>
                No infringements yet
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Tap "New Infringement" to create your first case
              </ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.casesList}>
              {recentCases.map((infringement) => (
                <TouchableOpacity
                  key={infringement.id}
                  style={[styles.caseCard, { borderColor: colors.icon }]}
                  onPress={() => {
                    // Navigate to case detail
                  }}
                >
                  <View style={styles.caseHeader}>
                    <ThemedText style={styles.caseCode}>
                      {infringement.offence_code}
                    </ThemedText>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            infringement.status === 'approved'
                              ? '#4CAF50'
                              : infringement.status === 'pending'
                              ? '#FF9800'
                              : '#9E9E9E',
                        },
                      ]}
                    >
                      <ThemedText style={styles.statusText}>
                        {formatInfringementStatus(infringement.status)}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.caseAmount}>
                    {formatCurrency(infringement.fine_amount)}
                  </ThemedText>
                  <ThemedText style={styles.caseDate}>
                    {formatDate(infringement.issued_at, 'long')}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  agencyName: {
    marginTop: 4,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
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
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  link: {
    fontSize: 14,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  casesList: {
    gap: 12,
  },
  caseCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  caseCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  caseAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  caseDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});
