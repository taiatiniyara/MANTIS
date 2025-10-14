import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { getInfringements, Infringement } from '@/lib/api/infringements';
import { IconSymbol } from '@/components/ui/icon-symbol';
import InfringementDetailModal from '@/components/infringement-detail-modal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function InfringementsScreen() {
  const { profile } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const [infringements, setInfringements] = useState<Infringement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedInfringement, setSelectedInfringement] = useState<Infringement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadInfringements = async () => {
    try {
      const data = await getInfringements();
      setInfringements(data);
    } catch (error) {
      console.error('Failed to load infringements:', error);
      Alert.alert('Error', 'Failed to load infringements. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInfringements();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadInfringements();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return '#f59e0b'; // amber
      case 'paid':
        return '#10b981'; // green
      case 'disputed':
        return '#ef4444'; // red
      case 'voided':
        return '#6b7280'; // gray
      default:
        return '#64748b';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Filter by search query and status
  const filteredInfringements = infringements.filter((inf) => {
    // Filter by status
    if (selectedStatus && inf.status !== selectedStatus) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const regNumber = inf.vehicle?.reg_number?.toLowerCase() || '';
      const infNumber = inf.infringement_number.toLowerCase();
      const offenceCode = inf.offence?.code?.toLowerCase() || '';
      const offenceDesc = inf.offence?.description?.toLowerCase() || '';
      
      return (
        regNumber.includes(query) ||
        infNumber.includes(query) ||
        offenceCode.includes(query) ||
        offenceDesc.includes(query)
      );
    }
    
    return true;
  });

  const renderStatusFilter = () => {
    const statuses = ['issued', 'paid', 'disputed', 'voided'];
    
    return (
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedStatus && styles.filterChipActive]}
          onPress={() => setSelectedStatus(null)}
        >
          <Text style={[styles.filterText, !selectedStatus && styles.filterTextActive]}>
            All ({infringements.length})
          </Text>
        </TouchableOpacity>
        {statuses.map((status) => {
          const count = infringements.filter((inf) => inf.status === status).length;
          if (count === 0) return null;
          
          return (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                selectedStatus === status && styles.filterChipActive,
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedStatus === status && styles.filterTextActive,
                ]}
              >
                {getStatusLabel(status)} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const handleCardPress = (infringement: Infringement) => {
    setSelectedInfringement(infringement);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedInfringement(null);
  };

  const renderInfringementCard = ({ item }: { item: Infringement }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCardPress(item)}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.infringementNumber}>{item.infringement_number}</Text>
          <Text style={styles.vehicleReg}>{item.vehicle?.reg_number || 'Unknown'}</Text>
          {item.vehicle?.make && (
            <Text style={styles.vehicleDetails}>
              {item.vehicle.make} {item.vehicle.model}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <IconSymbol name="exclamationmark.triangle" size={16} color="#64748b" />
          <Text style={styles.offenceText}>
            {item.offence?.code || 'N/A'} - {item.offence?.description || 'Unknown offence'}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            <IconSymbol name="calendar" size={16} color="#64748b" />
            <Text style={styles.dateText}>
              {new Date(item.issued_at).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.fineAmount}>${item.fine_amount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.cardAction}>
        <IconSymbol name="chevron.right" size={20} color="#94a3b8" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>
        {searchQuery ? '�' : '�📋'}
      </Text>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No Results Found' : 'No Infringements'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? `No infringements match "${searchQuery}". Try a different search term.`
          : selectedStatus
          ? `No ${selectedStatus} infringements found.`
          : profile?.role === 'citizen'
          ? "You don't have any infringements."
          : "No infringements created yet. Tap 'Create' to issue your first one."}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading infringements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {profile?.role === 'citizen' ? 'My Infringements' : 'Infringements'}
        </Text>
        <Text style={styles.subtitle}>
          {filteredInfringements.length} {filteredInfringements.length === 1 ? 'infringement' : 'infringements'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by registration, infringement #, or offence..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {renderStatusFilter()}

      <FlatList
        data={filteredInfringements}
        renderItem={renderInfringementCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredInfringements.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Detail Modal */}
      <InfringementDetailModal
        visible={modalVisible}
        infringement={selectedInfringement}
        onClose={handleCloseModal}
        onRefresh={loadInfringements}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  infringementNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  vehicleReg: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F97316',
    marginBottom: 2,
  },
  vehicleDetails: {
    fontSize: 13,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  offenceText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
  },
  fineAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cardAction: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});
