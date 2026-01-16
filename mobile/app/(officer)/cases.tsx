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
  Modal,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SyncStatus } from '@/components/SyncStatus';
import { useAuth } from '@/contexts/AuthContext';
import { getInfringements, getEvidenceFiles, getEvidenceFileUrl } from '@/lib/database';
import { Infringement, EvidenceFile } from '@/lib/types';
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
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'draft' | 'submitted'>('all');
  const [selectedCase, setSelectedCase] = useState<Infringement | null>(null);
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  useEffect(() => {
    if (selectedCase) {
      loadEvidence(selectedCase.id);
    }
  }, [selectedCase]);

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

  const loadEvidence = async (infringementId: string) => {
    setLoadingEvidence(true);
    try {
      const { data } = await getEvidenceFiles(infringementId);
      if (data) {
        const photoUrls = await Promise.all(
          data.map(async (file) => await getEvidenceFileUrl(file.file_path))
        );
        setEvidencePhotos(photoUrls);
      }
    } catch (error) {
      console.error('Error loading evidence:', error);
    } finally {
      setLoadingEvidence(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCases();
  };

  const handleCloseModal = () => {
    setSelectedCase(null);
    setEvidencePhotos([]);
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

      {/* Sync Status */}
      <View style={{ paddingHorizontal: 16 }}>
        <SyncStatus autoSync={false} />
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
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
            filter === 'draft' && { backgroundColor: colors.tint },
          ]}
          onPress={() => setFilter('draft')}
        >
          <ThemedText
            style={[
              styles.filterText,
              filter === 'draft' && styles.filterTextActive,
            ]}
          >
            Draft ({cases.filter(c => c.status === 'draft').length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'submitted' && { backgroundColor: colors.tint },
          ]}
          onPress={() => setFilter('submitted')}
        >
          <ThemedText
            style={[
              styles.filterText,
              filter === 'submitted' && styles.filterTextActive,
            ]}
          >
            Submitted ({cases.filter(c => c.status === 'submitted').length})
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
                onPress={() => setSelectedCase(infringement)}
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

      {/* Case Detail Modal */}
      <Modal
        visible={selectedCase !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.icon }]}>
            <ThemedText style={styles.modalTitle}>Case Details</ThemedText>
            <TouchableOpacity onPress={handleCloseModal}>
              <ThemedText style={[styles.closeButton, { color: colors.tint }]}>Close</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedCase && (
              <>
                {/* Status Badge */}
                <View
                  style={[
                    styles.modalStatusBadge,
                    {
                      backgroundColor:
                        selectedCase.status === 'approved'
                          ? '#4CAF50'
                          : selectedCase.status === 'pending'
                          ? '#FF9800'
                          : selectedCase.status === 'submitted'
                          ? '#2196F3'
                          : '#9E9E9E',
                    },
                  ]}
                >
                  <ThemedText style={styles.modalStatusText}>
                    {formatInfringementStatus(selectedCase.status)}
                  </ThemedText>
                </View>

                {/* Offence Information */}
                <View style={styles.modalSection}>
                  <ThemedText style={styles.modalSectionTitle}>Offence</ThemedText>
                  <View style={styles.modalInfoRow}>
                    <ThemedText style={styles.modalLabel}>Code:</ThemedText>
                    <ThemedText style={styles.modalValue}>{selectedCase.offence_code}</ThemedText>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <ThemedText style={styles.modalLabel}>Fine Amount:</ThemedText>
                    <ThemedText style={[styles.modalValue, styles.modalAmount]}>
                      {formatCurrency(selectedCase.fine_amount)}
                    </ThemedText>
                  </View>
                  {selectedCase.description && (
                    <View style={styles.modalInfoRow}>
                      <ThemedText style={styles.modalLabel}>Description:</ThemedText>
                      <ThemedText style={[styles.modalValue, { flex: 1 }]}>
                        {selectedCase.description}
                      </ThemedText>
                    </View>
                  )}
                </View>

                {/* Date Information */}
                <View style={styles.modalSection}>
                  <ThemedText style={styles.modalSectionTitle}>Date & Time</ThemedText>
                  <View style={styles.modalInfoRow}>
                    <ThemedText style={styles.modalLabel}>Issued:</ThemedText>
                    <ThemedText style={styles.modalValue}>
                      {formatDate(selectedCase.issued_at, 'long')}
                    </ThemedText>
                  </View>
                  {selectedCase.due_date && (
                    <View style={styles.modalInfoRow}>
                      <ThemedText style={styles.modalLabel}>Due:</ThemedText>
                      <ThemedText style={styles.modalValue}>
                        {formatDate(selectedCase.due_date, 'long')}
                      </ThemedText>
                    </View>
                  )}
                </View>

                {/* Location Information */}
                {selectedCase.location && (
                  <View style={styles.modalSection}>
                    <ThemedText style={styles.modalSectionTitle}>Location</ThemedText>
                    <ThemedText style={styles.modalValue}>
                      {(() => {
                        try {
                          const location = typeof selectedCase.location === 'string' 
                            ? JSON.parse(selectedCase.location) 
                            : selectedCase.location;
                          return location.properties?.address || 'No address available';
                        } catch {
                          return 'Invalid location data';
                        }
                      })()}
                    </ThemedText>
                  </View>
                )}

                {/* Driver Information */}
                {selectedCase.driver_id && (
                  <View style={styles.modalSection}>
                    <ThemedText style={styles.modalSectionTitle}>Driver</ThemedText>
                    <View style={styles.modalInfoRow}>
                      <ThemedText style={styles.modalLabel}>License:</ThemedText>
                      <ThemedText style={styles.modalValue}>
                        {/* This would need driver data to be loaded */}
                        Loading...
                      </ThemedText>
                    </View>
                  </View>
                )}

                {/* Vehicle Information */}
                {selectedCase.vehicle_id && (
                  <View style={styles.modalSection}>
                    <ThemedText style={styles.modalSectionTitle}>Vehicle</ThemedText>
                    <View style={styles.modalInfoRow}>
                      <ThemedText style={styles.modalLabel}>Plate:</ThemedText>
                      <ThemedText style={styles.modalValue}>
                        {/* This would need vehicle data to be loaded */}
                        Loading...
                      </ThemedText>
                    </View>
                  </View>
                )}

                {/* Notes */}
                {selectedCase.notes && (
                  <View style={styles.modalSection}>
                    <ThemedText style={styles.modalSectionTitle}>Notes</ThemedText>
                    <ThemedText style={styles.modalValue}>{selectedCase.notes}</ThemedText>
                  </View>
                )}

                {/* Evidence Photos */}
                <View style={styles.modalSection}>
                  <ThemedText style={styles.modalSectionTitle}>Evidence Photos</ThemedText>
                  {loadingEvidence ? (
                    <ActivityIndicator size="small" color={colors.tint} />
                  ) : evidencePhotos.length > 0 ? (
                    <View style={styles.photoGrid}>
                      {evidencePhotos.map((url, index) => (
                        <Image
                          key={index}
                          source={{ uri: url }}
                          style={styles.evidencePhoto}
                          resizeMode="cover"
                        />
                      ))}
                    </View>
                  ) : (
                    <ThemedText style={styles.modalValue}>No photos available</ThemedText>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </ThemedView>
      </Modal>
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginRight: 8,
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
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalStatusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 100,
  },
  modalValue: {
    fontSize: 14,
    opacity: 0.8,
  },
  modalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  evidencePhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
