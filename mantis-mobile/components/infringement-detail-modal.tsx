import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Infringement, voidInfringement } from '@/lib/api/infringements';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import PaymentModal from './payment-modal';
import DisputeModal from './dispute-modal';
import EvidenceViewer from './evidence-viewer';
import InfringementMapMobile from './maps/infringement-map-mobile';

interface InfringementDetailModalProps {
  visible: boolean;
  infringement: Infringement | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function InfringementDetailModal({
  visible,
  infringement,
  onClose,
  onRefresh,
}: InfringementDetailModalProps) {
  const { profile } = useAuth();
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [voiding, setVoiding] = useState(false);

  if (!infringement) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return '#f59e0b';
      case 'paid':
        return '#10b981';
      case 'disputed':
        return '#ef4444';
      case 'voided':
        return '#6b7280';
      default:
        return '#64748b';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canVoid = profile?.role === 'officer' || profile?.role === 'agency_admin';
  const canDispute = profile?.role === 'citizen';
  const canPay = profile?.role === 'citizen' && infringement.status === 'issued';

  const handleVoid = () => {
    Alert.alert(
      'Void Infringement',
      'Are you sure you want to void this infringement? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Void',
          style: 'destructive',
          onPress: async () => {
            setVoiding(true);
            try {
              await voidInfringement(infringement.id);
              Alert.alert(
                'Infringement Voided',
                'The infringement has been voided successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      onRefresh?.();
                      onClose();
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to void infringement');
            } finally {
              setVoiding(false);
            }
          },
        },
      ]
    );
  };

  const handleDispute = () => {
    setDisputeModalVisible(true);
  };

  const handlePay = () => {
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = () => {
    onRefresh?.();
  };

  const handleDisputeSuccess = () => {
    onRefresh?.();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Infringement Details</Text>
            <Text style={styles.headerSubtitle}>{infringement.infringement_number}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark.circle.fill" size={32} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Status Badge */}
          <View style={styles.section}>
            <View
              style={[
                styles.statusBadgeLarge,
                { backgroundColor: getStatusColor(infringement.status) },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {getStatusLabel(infringement.status)}
              </Text>
            </View>
          </View>

          {/* Vehicle Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <View style={styles.card}>
              <InfoRow
                icon="car.fill"
                label="Registration Number"
                value={infringement.vehicle?.reg_number || 'Unknown'}
                highlight
              />
              {infringement.vehicle?.make && (
                <InfoRow
                  icon="wrench.and.screwdriver.fill"
                  label="Make & Model"
                  value={`${infringement.vehicle.make} ${infringement.vehicle.model || ''}`}
                />
              )}
              {infringement.vehicle?.year && (
                <InfoRow
                  icon="calendar"
                  label="Year"
                  value={infringement.vehicle.year.toString()}
                />
              )}
              {infringement.vehicle?.color && (
                <InfoRow
                  icon="paintpalette.fill"
                  label="Color"
                  value={infringement.vehicle.color}
                />
              )}
            </View>
          </View>

          {/* Driver Information */}
          {infringement.driver_licence_number && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Driver Information</Text>
              <View style={styles.card}>
                <InfoRow
                  icon="person.fill"
                  label="Licence Number"
                  value={infringement.driver_licence_number}
                />
              </View>
            </View>
          )}

          {/* Offence Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Offence Details</Text>
            <View style={styles.card}>
              <InfoRow
                icon="exclamationmark.triangle.fill"
                label="Offence Code"
                value={infringement.offence?.code || 'Unknown'}
              />
              <InfoRow
                icon="doc.text.fill"
                label="Description"
                value={infringement.offence?.description || 'Unknown offence'}
              />
              {infringement.offence?.category && (
                <InfoRow
                  icon="folder.fill"
                  label="Category"
                  value={infringement.offence.category}
                />
              )}
              <InfoRow
                icon="dollarsign.circle.fill"
                label="Fine Amount"
                value={`$${infringement.fine_amount.toFixed(2)}`}
                highlight
              />
            </View>
          </View>

          {/* Location & Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location & Notes</Text>
            
            {/* Show map if GPS coordinates are available */}
            {infringement.location?.lat && infringement.location?.lng && (
              <View style={styles.mapContainer}>
                <InfringementMapMobile
                  latitude={infringement.location.lat}
                  longitude={infringement.location.lng}
                  address={infringement.location_description || undefined}
                  height={250}
                  showDirections={true}
                />
              </View>
            )}
            
            <View style={styles.card}>
              {infringement.location_description && (
                <InfoRow
                  icon="mappin.circle.fill"
                  label="Location"
                  value={infringement.location_description}
                  multiline
                />
              )}
              {infringement.location?.lat && infringement.location?.lng && (
                <InfoRow
                  icon="location.circle.fill"
                  label="GPS Coordinates"
                  value={`${infringement.location.lat.toFixed(6)}, ${infringement.location.lng.toFixed(6)}`}
                  multiline
                />
              )}
              {infringement.notes && (
                <InfoRow
                  icon="note.text"
                  label="Notes"
                  value={infringement.notes}
                  multiline
                />
              )}
            </View>
          </View>

          {/* Officer & Agency Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Issued By</Text>
            <View style={styles.card}>
              {infringement.officer?.display_name && (
                <InfoRow
                  icon="person.badge.shield.checkmark.fill"
                  label="Officer"
                  value={infringement.officer.display_name}
                />
              )}
              {infringement.agency?.name && (
                <InfoRow
                  icon="building.2.fill"
                  label="Agency"
                  value={infringement.agency.name}
                />
              )}
              <InfoRow
                icon="calendar.badge.clock"
                label="Issued Date"
                value={formatDate(infringement.issued_at)}
              />
            </View>
          </View>

          {/* Evidence */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evidence</Text>
            <View style={styles.card}>
              <EvidenceViewer evidenceUrls={infringement.evidence_urls || []} />
            </View>
          </View>

          {/* Timestamps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Record Information</Text>
            <View style={styles.card}>
              <InfoRow
                icon="clock.fill"
                label="Created"
                value={formatDate(infringement.created_at)}
              />
              <Text style={styles.recordId}>ID: {infringement.id}</Text>
            </View>
          </View>

          {/* Spacer for action buttons */}
          <View style={styles.spacer} />
        </ScrollView>

        {/* Action Buttons */}
        {(canVoid || canDispute || canPay) && (
          <View style={styles.actionBar}>
            {canPay && (
              <TouchableOpacity style={styles.primaryButton} onPress={handlePay}>
                <IconSymbol name="creditcard.fill" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Pay ${infringement.fine_amount.toFixed(2)}</Text>
              </TouchableOpacity>
            )}
            {canDispute && !canPay && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleDispute}>
                <IconSymbol name="exclamationmark.bubble.fill" size={20} color="#3b82f6" />
                <Text style={styles.secondaryButtonText}>Dispute</Text>
              </TouchableOpacity>
            )}
            {canVoid && (
              <TouchableOpacity style={styles.dangerButton} onPress={handleVoid}>
                <IconSymbol name="xmark.circle.fill" size={20} color="#fff" />
                <Text style={styles.dangerButtonText}>Void</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Payment Modal */}
      <PaymentModal
        visible={paymentModalVisible}
        infringement={infringement}
        onClose={() => setPaymentModalVisible(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Dispute Modal */}
      <DisputeModal
        visible={disputeModalVisible}
        infringement={infringement}
        onClose={() => setDisputeModalVisible(false)}
        onSuccess={handleDisputeSuccess}
      />
    </Modal>
  );
}

// Helper component for info rows
function InfoRow({
  icon,
  label,
  value,
  highlight = false,
  multiline = false,
}: {
  icon: any;
  label: string;
  value: string;
  highlight?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={[styles.infoRow, multiline && styles.infoRowMultiline]}>
      <View style={styles.infoRowHeader}>
        <IconSymbol name={icon as any} size={16} color="#64748b" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusBadgeLarge: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: 'center',
    marginVertical: 8,
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoRowMultiline: {
    marginBottom: 16,
  },
  infoRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 22,
  },
  infoValueHighlight: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
  },
  recordId: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  comingSoonText: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 8,
  },
  spacer: {
    height: 120,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  dangerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  mapContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});
