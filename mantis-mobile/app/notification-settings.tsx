import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  getUserPushTokens,
  NotificationPreferences,
  PushToken,
} from '@/lib/api/notifications';

export default function NotificationSettings() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [pushTokens, setPushTokens] = useState<PushToken[]>([]);

  useEffect(() => {
    loadPreferences();
    loadPushTokens();
  }, [profile]);

  const loadPreferences = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const prefs = await getNotificationPreferences(profile.id);
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      Alert.alert('Error', 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const loadPushTokens = async () => {
    if (!profile) return;
    
    try {
      const tokens = await getUserPushTokens(profile.id);
      setPushTokens(tokens);
    } catch (error) {
      console.error('Error loading push tokens:', error);
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    if (!profile || !preferences) return;

    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    
    setPreferences(newPreferences);
    
    setSaving(true);
    try {
      const success = await updateNotificationPreferences(profile.id, { [key]: newPreferences[key] });
      if (!success) {
        // Revert on failure
        setPreferences(preferences);
        Alert.alert('Error', 'Failed to update notification preference');
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      setPreferences(preferences);
      Alert.alert('Error', 'Failed to update notification preference');
    } finally {
      setSaving(false);
    }
  };

  const formatDeviceType = (type: string | null) => {
    if (!type) return 'Unknown';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notification Settings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading preferences...</Text>
        </View>
      </View>
    );
  }

  if (!preferences) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notification Settings</Text>
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load preferences</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPreferences}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notification Settings</Text>
        <Text style={styles.subtitle}>
          Choose which notifications you want to receive
        </Text>
      </View>

      {/* Payment Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="creditcard.fill" size={24} color="#10b981" />
          <Text style={styles.sectionTitle}>Payment Notifications</Text>
        </View>
        
        <PreferenceToggle
          label="Payment Received"
          description="When a payment is successfully processed"
          value={preferences.payment_received}
          onToggle={() => handleToggle('payment_received')}
          disabled={saving}
        />
        
        <PreferenceToggle
          label="Payment Reminder"
          description="3 days before payment due date"
          value={preferences.payment_reminder}
          onToggle={() => handleToggle('payment_reminder')}
          disabled={saving}
        />
      </View>

      {/* Dispute Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="exclamationmark.bubble.fill" size={24} color="#f59e0b" />
          <Text style={styles.sectionTitle}>Dispute Notifications</Text>
        </View>
        
        <PreferenceToggle
          label="Dispute Submitted"
          description="When you submit a new dispute"
          value={preferences.dispute_submitted}
          onToggle={() => handleToggle('dispute_submitted')}
          disabled={saving}
        />
        
        <PreferenceToggle
          label="Dispute Resolved"
          description="When your dispute is resolved"
          value={preferences.dispute_resolved}
          onToggle={() => handleToggle('dispute_resolved')}
          disabled={saving}
        />
      </View>

      {/* Infringement Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="doc.text.fill" size={24} color="#ef4444" />
          <Text style={styles.sectionTitle}>Infringement Notifications</Text>
        </View>
        
        <PreferenceToggle
          label="Infringement Issued"
          description="When a new infringement is issued to you"
          value={preferences.infringement_issued}
          onToggle={() => handleToggle('infringement_issued')}
          disabled={saving}
        />
        
        <PreferenceToggle
          label="Infringement Voided"
          description="When an infringement is voided or cancelled"
          value={preferences.infringement_voided}
          onToggle={() => handleToggle('infringement_voided')}
          disabled={saving}
        />
      </View>

      {/* Officer Notifications (only show for officers) */}
      {profile?.role !== 'citizen' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="person.badge.shield.checkmark.fill" size={24} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Officer Notifications</Text>
          </View>
          
          <PreferenceToggle
            label="Assignment Received"
            description="When you're assigned a new task"
            value={preferences.assignment_received}
            onToggle={() => handleToggle('assignment_received')}
            disabled={saving}
          />
          
          <PreferenceToggle
            label="Daily Summary"
            description="Daily summary of your activities"
            value={preferences.daily_summary}
            onToggle={() => handleToggle('daily_summary')}
            disabled={saving}
          />
        </View>
      )}

      {/* System Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="bell.fill" size={24} color="#6b7280" />
          <Text style={styles.sectionTitle}>System Notifications</Text>
        </View>
        
        <PreferenceToggle
          label="System Alerts"
          description="Important system updates and maintenance notices"
          value={preferences.system_alerts}
          onToggle={() => handleToggle('system_alerts')}
          disabled={saving}
        />
      </View>

      {/* Device Info */}
      {pushTokens.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="iphone" size={24} color="#64748b" />
            <Text style={styles.sectionTitle}>Registered Devices</Text>
          </View>
          
          <View style={styles.devicesContainer}>
            {pushTokens.map((token) => (
              <View key={token.id} style={styles.deviceCard}>
                <View style={styles.deviceInfo}>
                  <IconSymbol 
                    name={token.device_type === 'ios' ? 'iphone' : 'smartphone'} 
                    size={20} 
                    color="#64748b" 
                  />
                  <View style={styles.deviceText}>
                    <Text style={styles.deviceName}>
                      {token.device_name || 'Unknown Device'}
                    </Text>
                    <Text style={styles.deviceDetail}>
                      {formatDeviceType(token.device_type)} • Last used {formatDate(token.last_used_at)}
                    </Text>
                  </View>
                </View>
                {token.is_active && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <IconSymbol name="info.circle.fill" size={20} color="#3b82f6" />
        <Text style={styles.infoBannerText}>
          Notifications help you stay updated on important activities. You can change these settings anytime.
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

interface PreferenceToggleProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function PreferenceToggle({ label, description, value, onToggle, disabled }: PreferenceToggleProps) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceInfo}>
        <Text style={styles.preferenceLabel}>{label}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
        thumbColor={value ? '#3b82f6' : '#f4f4f5'}
        ios_backgroundColor="#e2e8f0"
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
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  devicesContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  deviceText: {
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  deviceDetail: {
    fontSize: 13,
    color: '#64748b',
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginTop: 24,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});
