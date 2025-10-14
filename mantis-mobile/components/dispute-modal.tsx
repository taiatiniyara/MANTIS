import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  createDispute,
  DisputeReason,
  type Infringement,
} from '@/lib/api/infringements';

interface DisputeModalProps {
  visible: boolean;
  infringement: Infringement | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DisputeModal({
  visible,
  infringement,
  onClose,
  onSuccess,
}: DisputeModalProps) {
  const [selectedReason, setSelectedReason] = useState<DisputeReason | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!infringement) return null;

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for your dispute');
      return;
    }

    if (description.trim().length < 20) {
      Alert.alert('Error', 'Please provide a detailed description (minimum 20 characters)');
      return;
    }

    Alert.alert(
      'Confirm Dispute',
      'Are you sure you want to dispute this infringement? Once submitted, it will be reviewed by the issuing agency.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Dispute',
          style: 'default',
          onPress: async () => {
            setSubmitting(true);
            try {
              await createDispute({
                infringement_id: infringement.id,
                reason: selectedReason,
                description: description.trim(),
              });

              Alert.alert(
                'Dispute Submitted',
                'Your dispute has been submitted successfully. You will be notified once it has been reviewed.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      onSuccess();
                      onClose();
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Submission Failed', error.message || 'Please try again later.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const disputeReasons: Array<{ value: DisputeReason; label: string; icon: string }> = [
    {
      value: 'not_my_vehicle',
      label: 'Not My Vehicle',
      icon: 'car.fill',
    },
    {
      value: 'incorrect_details',
      label: 'Incorrect Details',
      icon: 'exclamationmark.triangle.fill',
    },
    {
      value: 'vehicle_stolen',
      label: 'Vehicle Was Stolen',
      icon: 'lock.shield.fill',
    },
    {
      value: 'parking_permit',
      label: 'Valid Parking Permit',
      icon: 'ticket.fill',
    },
    {
      value: 'emergency',
      label: 'Emergency Situation',
      icon: 'light.beacon.max.fill',
    },
    {
      value: 'other',
      label: 'Other Reason',
      icon: 'ellipsis.circle.fill',
    },
  ];

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
          <View>
            <Text style={styles.title}>Dispute Infringement</Text>
            <Text style={styles.subtitle}>{infringement.infringement_number}</Text>
          </View>
          <TouchableOpacity onPress={onClose} disabled={submitting}>
            <IconSymbol name="xmark.circle.fill" size={28} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Infringement Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFRINGEMENT DETAILS</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Offence</Text>
                <Text style={styles.summaryValue}>
                  {infringement.offence?.description || 'N/A'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Vehicle</Text>
                <Text style={styles.summaryValue}>
                  {infringement.vehicle?.reg_number || 'N/A'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fine Amount</Text>
                <Text style={styles.summaryValue}>
                  ${infringement.fine_amount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Dispute Reason Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SELECT DISPUTE REASON</Text>
            {disputeReasons.map((reason) => (
              <TouchableOpacity
                key={reason.value}
                style={[
                  styles.reasonCard,
                  selectedReason === reason.value && styles.reasonCardSelected,
                ]}
                onPress={() => setSelectedReason(reason.value)}
                disabled={submitting}
              >
                <View style={styles.reasonLeft}>
                  <View
                    style={[
                      styles.reasonIcon,
                      selectedReason === reason.value && styles.reasonIconSelected,
                    ]}
                  >
                    <IconSymbol
                      name={reason.icon as any}
                      size={20}
                      color={selectedReason === reason.value ? '#fff' : '#ef4444'}
                    />
                  </View>
                  <Text style={styles.reasonLabel}>{reason.label}</Text>
                </View>
                {selectedReason === reason.value && (
                  <IconSymbol name="checkmark.circle.fill" size={24} color="#ef4444" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DESCRIPTION</Text>
            <Text style={styles.inputHint}>
              Please provide a detailed explanation for your dispute (minimum 20 characters)
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="Explain why you are disputing this infringement..."
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!submitting}
              maxLength={500}
            />
            <Text style={styles.charCount}>
              {description.length}/500 characters
            </Text>
          </View>

          {/* Evidence Upload (Coming Soon) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SUPPORTING EVIDENCE (OPTIONAL)</Text>
            <TouchableOpacity style={styles.uploadCard} disabled>
              <IconSymbol name="photo.badge.plus" size={32} color="#94a3b8" />
              <Text style={styles.uploadText}>Photo Upload Coming Soon</Text>
              <Text style={styles.uploadHint}>
                You'll be able to attach photos as evidence
              </Text>
            </TouchableOpacity>
          </View>

          {/* Warning Notice */}
          <View style={styles.notice}>
            <IconSymbol name="exclamationmark.triangle" size={20} color="#f59e0b" />
            <Text style={styles.noticeText}>
              Please ensure all information is accurate. False disputes may result in additional
              penalties. Your dispute will be reviewed within 5-10 business days.
            </Text>
          </View>
        </ScrollView>

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={onClose}
            disabled={submitting}
          >
            <Text style={styles.buttonSecondaryText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonPrimary,
              (!selectedReason || description.trim().length < 20 || submitting) &&
                styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedReason || description.trim().length < 20 || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <IconSymbol name="checkmark.circle" size={20} color="#fff" />
                <Text style={styles.buttonPrimaryText}>Submit Dispute</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  reasonCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  reasonCardSelected: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  reasonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reasonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonIconSelected: {
    backgroundColor: '#ef4444',
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  inputHint: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 18,
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1e293b',
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 8,
  },
  uploadCard: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
  },
  uploadHint: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  notice: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    margin: 16,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonPrimary: {
    backgroundColor: '#ef4444',
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
