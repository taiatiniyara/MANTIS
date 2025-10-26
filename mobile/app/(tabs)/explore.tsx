import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { infringements, storage, supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface Infringement {
  id: string;
  vehicle_id: string;
  vehicle_type?: 'car' | 'motorcycle' | 'truck' | 'bus' | 'other';
  infringement_type_id: string;
  status?: 'pending' | 'paid' | 'disputed' | 'cancelled';
  fine_amount?: number;
  latitude?: number;
  longitude?: number;
  notes: string | null;
  created_at: string;
  infringement_type?: {
    code: string;
    description: string;
  };
}

type FilterStatus = 'all' | 'pending' | 'paid' | 'disputed' | 'cancelled';

export default function InfringementsScreen() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<Infringement[]>([]);
  const [filteredData, setFilteredData] = useState<Infringement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [selectedInfringement, setSelectedInfringement] = useState<Infringement | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  useEffect(() => {
    loadInfringements();
  }, []);

  useEffect(() => {
    filterData();
  }, [data, searchQuery, statusFilter]);

  const loadInfringements = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      const { data: infringementData, error } = await infringements.list(profile.id, 100);
      
      if (error) {
        console.error('Error loading infringements:', error);
        Alert.alert('Error', 'Failed to load infringements');
        return;
      }

      setData(infringementData || []);
    } catch (err) {
      console.error('Exception loading infringements:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInfringements();
    setRefreshing(false);
  }, [profile]);

  const filterData = () => {
    let filtered = data;

    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        item.vehicle_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    setFilteredData(filtered);
  };

  const loadPhotosForInfringement = async (infringementId: string) => {
    setLoadingPhotos(true);
    setPhotoUrls([]);
    
    try {
      // List all files in the evidence-photos bucket that start with the infringement ID
      const { data: files, error } = await supabase.storage
        .from('evidence-photos')
        .list('', {
          search: infringementId,
        });

      if (error) {
        console.error('Error listing photos:', error);
        return;
      }

      if (files && files.length > 0) {
        // Get public URLs for all photos
        const urls = files
          .filter((file: any) => file.name.startsWith(infringementId))
          .map((file: any) => storage.getPhotoUrl(file.name));
        
        setPhotoUrls(urls);
      }
    } catch (err) {
      console.error('Exception loading photos:', err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'paid':
        return '#34C759';
      case 'disputed':
        return '#FF3B30';
      case 'cancelled':
        return '#8E8E93';
      default:
        return '#007AFF';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'all': return '📋';
      case 'pending': return '⏳';
      case 'paid': return '✅';
      case 'disputed': return '⚠️';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const renderFilterChip = (label: string, value: string) => {
    const isActive = statusFilter === value;
    const statusColor = getStatusColor(value);
    return (
      <TouchableOpacity
        key={value}
        style={[
          styles.filterChip,
          isActive && { backgroundColor: statusColor, borderColor: statusColor }
        ]}
        onPress={() => setStatusFilter(value as any)}
      >
        <Text style={styles.filterEmoji}>{getStatusEmoji(value)}</Text>
        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car': return '🚗';
      case 'motorcycle': return '🏍️';
      case 'truck': return '🚛';
      case 'bus': return '🚌';
      default: return '🚗';
    }
  };

  const renderInfringementCard = ({ item }: { item: Infringement }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedInfringement(item);
          setShowDetailsModal(true);
          loadPhotosForInfringement(item.id);
        }}
      >
        {/* Header with vehicle info and status */}
        <View style={styles.cardHeader}>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleIcon}>{getVehicleIcon(item.vehicle_type || 'other')}</Text>
            <View>
              <Text style={styles.vehicleId}>{item.vehicle_id}</Text>
              <Text style={styles.vehicleType}>{item.vehicle_type || 'Unknown'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status || 'pending') }]}>
            <Text style={styles.statusText}>{(item.status || 'pending').toUpperCase()}</Text>
          </View>
        </View>

        {/* Infringement type */}
        <View style={styles.infringementType}>
          <Text style={styles.infringementCode}>{item.infringement_type?.code || 'N/A'}</Text>
          <Text style={styles.infringementDescription}>
            {item.infringement_type?.description || 'No description available'}
          </Text>
        </View>

        {/* Fine amount - prominent */}
        <View style={styles.fineContainer}>
          <Text style={styles.fineLabel}>Fine Amount</Text>
          <Text style={styles.fineAmount}>$ {(item.fine_amount || 0).toFixed(2)}</Text>
        </View>

        {/* Additional details */}
        <View style={styles.detailsContainer}>
          {item.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📝</Text>
              <Text style={styles.detailText} numberOfLines={2}>
                {item.notes}
              </Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>
              {(item.latitude || 0).toFixed(5)}, {(item.longitude || 0).toFixed(5)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🕐</Text>
            <Text style={styles.detailText}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No infringements found</Text>
        {searchQuery || statusFilter !== 'all' ? (
          <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
        ) : (
          <>
            <Text style={styles.emptySubtext}>Start recording infringements</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/infringement')}
            >
              <Text style={styles.emptyButtonText}>Record Infringement</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  const renderDetailsModal = () => {
    if (!selectedInfringement) return null;

    return (
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Infringement Details</Text>
              <Text style={styles.modalSubtitle}>{selectedInfringement.vehicle_id}</Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Status Badge */}
            <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedInfringement.status || 'pending') }]}>
              <Text style={styles.modalStatusText}>{(selectedInfringement.status || 'pending').toUpperCase()}</Text>
            </View>

            {/* Vehicle Information */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🚗 Vehicle Information</Text>
              <View style={styles.modalDetailCard}>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Registration:</Text>
                  <Text style={styles.modalDetailValue}>{selectedInfringement.vehicle_id}</Text>
                </View>
                {selectedInfringement.vehicle_type && (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Type:</Text>
                    <Text style={styles.modalDetailValue}>{selectedInfringement.vehicle_type}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Infringement Type */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>⚠️ Violation Details</Text>
              <View style={styles.modalDetailCard}>
                <Text style={styles.modalViolationCode}>
                  {selectedInfringement.infringement_type?.code || 'N/A'}
                </Text>
                <Text style={styles.modalViolationDescription}>
                  {selectedInfringement.infringement_type?.description || 'No description available'}
                </Text>
              </View>
            </View>

            {/* Fine Amount */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>💰 Fine Amount</Text>
              <View style={styles.modalFineCard}>
                <Text style={styles.modalFineAmount}>
                  $ {(selectedInfringement.fine_amount || 0).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>📍 Location</Text>
              <View style={styles.modalDetailCard}>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Latitude:</Text>
                  <Text style={styles.modalDetailValue}>
                    {(selectedInfringement.latitude || 0).toFixed(6)}
                  </Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Longitude:</Text>
                  <Text style={styles.modalDetailValue}>
                    {(selectedInfringement.longitude || 0).toFixed(6)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Notes */}
            {selectedInfringement.notes && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>📝 Notes</Text>
                <View style={styles.modalDetailCard}>
                  <Text style={styles.modalNotesText}>{selectedInfringement.notes}</Text>
                </View>
              </View>
            )}

            {/* Date/Time */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🕐 Recorded</Text>
              <View style={styles.modalDetailCard}>
                <Text style={styles.modalDateText}>
                  {new Date(selectedInfringement.created_at).toLocaleString('en-FJ', {
                    dateStyle: 'full',
                    timeStyle: 'long',
                  })}
                </Text>
              </View>
            </View>

            {/* Photos - Placeholder for now, will show if photos are available */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>📸 Evidence Photos</Text>
              <View style={styles.modalDetailCard}>
                {loadingPhotos ? (
                  <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.modalPhotoPlaceholder}>Loading photos...</Text>
                  </View>
                ) : photoUrls.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {photoUrls.map((url, index) => (
                      <View key={index} style={{ marginRight: 12 }}>
                        <Image
                          source={{ uri: url }}
                          style={{ width: 200, height: 200, borderRadius: 8 }}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.modalPhotoPlaceholder}>
                    No photos available
                  </Text>
                )}
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading infringements...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Compact Header */}
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredData.length}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search vehicle ID..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="characters"
        />
      </View>

      {/* Compact Filter Chips */}
      <ScrollView
        horizontal
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {renderFilterChip('All', 'all')}
        {renderFilterChip('Pending', 'pending')}
        {renderFilterChip('Paid', 'paid')}
        {renderFilterChip('Disputed', 'disputed')}
        {renderFilterChip('Cancelled', 'cancelled')}
      </ScrollView>

      <FlatList
        data={filteredData}
        renderItem={renderInfringementCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
      />

      {/* Details Modal */}
      {renderDetailsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    position: 'absolute',
    left: 32,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 15,
    color: '#000',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
    height: 60,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    marginRight: 8,
  },
  filterEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  vehicleId: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  vehicleType: {
    fontSize: 13,
    color: '#8E8E93',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  infringementType: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  infringementCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infringementDescription: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  fineContainer: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fineLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fineAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: -0.5,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: '#5A6C7D',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#007AFF',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalStatusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  modalStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  modalDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  modalDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'right',
  },
  modalViolationCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  modalViolationDescription: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 22,
  },
  modalFineCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalFineAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2E7D32',
  },
  modalNotesText: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 24,
  },
  modalDateText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 22,
  },
  modalPhotoPlaceholder: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
});
