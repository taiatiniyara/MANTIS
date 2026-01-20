/**
 * MANTIS Mobile - Cases List Screen
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CaseCard } from '@/components/CaseCard';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { getInfringements } from '@/lib/database';
import { Infringement } from '@/lib/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { queryKeys } from '@/lib/queryKeys';

export default function CasesListScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const {
    data: cases = [],
    isPending,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: queryKeys.infringementsByOfficer(user?.id, 100),
    queryFn: async () => {
      if (!user?.id) return [] as Infringement[];
      const { data, error } = await getInfringements({
        officer_id: user.id,
        limit: 100,
      });
      if (error) throw new Error(error.message || 'Failed to load cases');
      return data ?? [];
    },
    enabled: Boolean(user?.id),
  });

  const filteredCases = useMemo(() => {
    let filteredList = cases;

    if (filter !== 'all') {
      filteredList = filteredList.filter(c => c.status === filter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredList = filteredList.filter(
        c =>
          c.offence_code.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }
    return filteredList;
  }, [cases, filter, searchQuery]);

  const onRefresh = () => {
    refetch();
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
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
      </ScrollView>

      {/* Cases List */}
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={onRefresh} />
        }
      >
        {isPending ? (
          <ThemedText style={styles.emptyText}>Loading...</ThemedText>
        ) : error ? (
          <ThemedText style={styles.emptyText}>Couldn&apos;t load cases.</ThemedText>
        ) : filteredCases.length === 0 ? (
          <EmptyState
            title="No cases found"
            message={searchQuery ? 'Try adjusting your search' : undefined}
          />
        ) : (
          <View style={styles.casesList}>
            {filteredCases.map(infringement => (
              <CaseCard
                key={infringement.id}
                code={infringement.offence_code}
                amount={infringement.fine_amount}
                status={infringement.status}
                issuedAt={infringement.issued_at}
                description={infringement.description}
              />
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    maxHeight: 44,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    height: 36,
  },
  filterButton: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    flexShrink: 0,
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
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
});
