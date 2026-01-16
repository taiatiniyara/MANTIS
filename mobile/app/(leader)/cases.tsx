/**
 * MANTIS Mobile - Cases List Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { getInfringements } from '@/lib/database';
import { Infringement } from '@/lib/types';
import { formatDate, formatCurrency, formatInfringementStatus } from '@/lib/formatting';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CasesListScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [cases, setCases] = useState<Infringement[]>([]);
  const [filteredCases, setFilteredCases] = useState<Infringement[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, searchQuery, filter]);

  const loadCases = async () => {
    if (!user) return;

    try {
      const { data } = await getInfringements({
        officer_id: user.id,
        limit: 100,
      });

      if (data) {
        setCases(data);
      }
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterCases = () => {
    let filtered = cases;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(c => c.status === filter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.offence_code.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    setFilteredCases(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCases();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { color: colors.text, borderColor: colors.icon }]}
          placeholder="Search by offence code..."
          placeholderTextColor={colors.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && { backgroundColor: colors.tint },
          ]}
          onPress={() => setFilter('all')}
        >
          <ThemedText
            style={[styles.filterText, filter === 'all' && styles.filterTextActive]}
          >
            All ({cases.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'pending' && { backgroundColor: colors.tint },
          ]}
          onPress={() => setFilter('pending')}
        >
          <ThemedText
            style={[
              styles.filterText,
              filter === 'pending' && styles.filterTextActive,
            ]}
          >
            Pending ({cases.filter(c => c.status === 'pending').length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'approved' && { backgroundColor: colors.tint },
          ]}
          onPress={() => setFilter('approved')}
        >
          <ThemedText
            style={[
              styles.filterText,
              filter === 'approved' && styles.filterTextActive,
            ]}
          >
            Approved ({cases.filter(c => c.status === 'approved').length})
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Cases List */}
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ThemedText style={styles.emptyText}>Loading...</ThemedText>
        ) : filteredCases.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No cases found</ThemedText>
            {searchQuery && (
              <ThemedText style={styles.emptySubtext}>
                Try adjusting your search
              </ThemedText>
            )}
          </View>
        ) : (
          <View style={styles.casesList}>
            {filteredCases.map((infringement) => (
              <TouchableOpacity
                key={infringement.id}
                style={[styles.caseCard, { borderColor: colors.icon }]}
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
                {infringement.description && (
                  <ThemedText style={styles.caseDescription} numberOfLines={2}>
                    {infringement.description}
                  </ThemedText>
                )}
                <ThemedText style={styles.caseDate}>
                  {formatDate(infringement.issued_at, 'long')}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  filterText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  casesList: {
    padding: 16,
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
  caseDescription: {
    fontSize: 14,
    opacity: 0.7,
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
