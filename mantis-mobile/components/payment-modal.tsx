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
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  createPayment,
  PaymentMethod,
  type Infringement,
} from '@/lib/api/infringements';

interface PaymentModalProps {
  visible: boolean;
  infringement: Infringement | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({
  visible,
  infringement,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);

  if (!infringement) return null;

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Pay $${infringement.fine_amount.toFixed(2)} using ${getMethodLabel(selectedMethod)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          style: 'default',
          onPress: async () => {
            setProcessing(true);
            try {
              await createPayment({
                infringement_id: infringement.id,
                amount: infringement.fine_amount,
                payment_method: selectedMethod,
                reference_number: generateReferenceNumber(),
              });

              Alert.alert(
                'Payment Successful',
                `Your payment of $${infringement.fine_amount.toFixed(2)} has been processed.`,
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
              Alert.alert('Payment Failed', error.message || 'Please try again later.');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const getMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'm_paisa':
        return 'M-PAiSA';
      case 'my_cash':
        return 'MyCash';
    }
  };

  const getMethodIcon = (method: PaymentMethod): string => {
    switch (method) {
      case 'card':
        return 'creditcard.fill';
      case 'm_paisa':
        return 'phone.fill';
      case 'my_cash':
        return 'wallet.pass.fill';
    }
  };

  const generateReferenceNumber = (): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `PAY-${timestamp}-${random}`;
  };

  const paymentMethods: PaymentMethod[] = ['card', 'm_paisa', 'my_cash'];

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
            <Text style={styles.title}>Make Payment</Text>
            <Text style={styles.subtitle}>{infringement.infringement_number}</Text>
          </View>
          <TouchableOpacity onPress={onClose} disabled={processing}>
            <IconSymbol name="xmark.circle.fill" size={28} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Amount Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AMOUNT DUE</Text>
            <View style={styles.amountCard}>
              <Text style={styles.currency}>FJD</Text>
              <Text style={styles.amount}>${infringement.fine_amount.toFixed(2)}</Text>
            </View>
          </View>

          {/* Infringement Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFRINGEMENT DETAILS</Text>
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Offence</Text>
                <Text style={styles.detailValue}>
                  {infringement.offence?.description || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vehicle</Text>
                <Text style={styles.detailValue}>
                  {infringement.vehicle?.reg_number || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date Issued</Text>
                <Text style={styles.detailValue}>
                  {new Date(infringement.issued_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Method Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.methodCard,
                  selectedMethod === method && styles.methodCardSelected,
                ]}
                onPress={() => setSelectedMethod(method)}
                disabled={processing}
              >
                <View style={styles.methodLeft}>
                  <View
                    style={[
                      styles.methodIcon,
                      selectedMethod === method && styles.methodIconSelected,
                    ]}
                  >
                    <IconSymbol
                      name={getMethodIcon(method) as any}
                      size={24}
                      color={selectedMethod === method ? '#fff' : '#3b82f6'}
                    />
                  </View>
                  <Text style={styles.methodLabel}>{getMethodLabel(method)}</Text>
                </View>
                {selectedMethod === method && (
                  <IconSymbol name="checkmark.circle.fill" size={24} color="#3b82f6" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Notice */}
          <View style={styles.notice}>
            <IconSymbol name="info.circle" size={20} color="#3b82f6" />
            <Text style={styles.noticeText}>
              Your payment will be processed immediately. A receipt will be available after
              successful payment.
            </Text>
          </View>
        </ScrollView>

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={onClose}
            disabled={processing}
          >
            <Text style={styles.buttonSecondaryText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonPrimary,
              (!selectedMethod || processing) && styles.buttonDisabled,
            ]}
            onPress={handlePayment}
            disabled={!selectedMethod || processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <IconSymbol name="creditcard" size={20} color="#fff" />
                <Text style={styles.buttonPrimaryText}>
                  Pay ${infringement.fine_amount.toFixed(2)}
                </Text>
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
  amountCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  currency: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  amount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  detailsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  methodCard: {
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
  methodCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconSelected: {
    backgroundColor: '#3b82f6',
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  notice: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    margin: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
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
    backgroundColor: '#3b82f6',
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
