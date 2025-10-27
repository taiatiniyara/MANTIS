import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { infringements } from '@/lib/supabase';
import { gpsService, LocationData } from '@/lib/gps-service';
import NetInfo from '@react-native-community/netinfo';

export default function DashboardScreen() {
  const { profile, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
  });
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [gpsPermission, setGpsPermission] = useState(false);

  useEffect(() => {
    checkConnectivity();
    checkGPSPermission();
    loadDashboardData();

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnectivity = async () => {
    const netInfo = await NetInfo.fetch();
    setIsOnline(netInfo.isConnected ?? false);
  };

  const checkGPSPermission = async () => {
    const hasPermission = await gpsService.hasPermissions();
    setGpsPermission(hasPermission);
    
    if (hasPermission) {
      const loc = await gpsService.getCurrentLocation();
      setLocation(loc);
    }
  };

  const loadDashboardData = async () => {
    try {
      if (!profile?.id) return;

      const { data, error } = await infringements.list(profile.id, 100);
      
      if (error) {
        console.error('Error loading dashboard data:', error);
        return;
      }

      if (data) {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        setStats({
          today: data.filter(i => new Date(i.issued_at) >= todayStart).length,
          thisWeek: data.filter(i => new Date(i.issued_at) >= weekStart).length,
          thisMonth: data.filter(i => new Date(i.issued_at) >= monthStart).length,
          total: data.length,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkConnectivity();
    await checkGPSPermission();
    await loadDashboardData();
    setRefreshing(false);
  };

  const requestGPSPermission = async () => {
    const result = await gpsService.requestPermissions();
    setGpsPermission(result.granted);
    
    if (result.granted) {
      const loc = await gpsService.getCurrentLocation();
      setLocation(loc);
      Alert.alert('Success', 'GPS permission granted');
    } else {
      Alert.alert(
        'Permission Denied',
        'GPS permission is required to record infringements with location data.'
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{profile?.full_name || profile?.position || 'Officer'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Status Indicators */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, isOnline ? styles.online : styles.offline]}>
          <Ionicons 
            name={isOnline ? "wifi" : "wifi-outline"} 
            size={16} 
            color={isOnline ? "#10B981" : "#EF4444"} 
          />
          <Text style={styles.statusText}>
            {isOnline ? ' Online' : ' Offline'}
          </Text>
        </View>
        <View style={[styles.statusBadge, gpsPermission ? styles.online : styles.offline]}>
          <Ionicons 
            name={gpsPermission ? "location" : "location-outline"} 
            size={16} 
            color={gpsPermission ? "#10B981" : "#EF4444"} 
          />
          <Text style={styles.statusText}>
            {gpsPermission ? ' GPS Active' : ' GPS Off'}
          </Text>
        </View>
      </View>

      {/* GPS Permission Alert */}
      {!gpsPermission && (
        <TouchableOpacity style={styles.alertBox} onPress={requestGPSPermission}>
          <View style={styles.alertHeader}>
            <Ionicons name="warning" size={20} color="#DC2626" />
            <Text style={styles.alertTitle}> GPS Permission Required</Text>
          </View>
          <Text style={styles.alertText}>
            Tap here to enable location services for accurate infringement recording
          </Text>
        </TouchableOpacity>
      )}

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={[styles.statNumber, { color: '#fff' }]}>{stats.today}</Text>
          <Text style={[styles.statLabel, { color: '#fff' }]}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.thisWeek}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.thisMonth}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction]}
          onPress={() => router.push('/(tabs)/infringement')}
        >
          <View style={[styles.actionIcon, styles.primaryActionIcon]}>
            <Ionicons name="warning" size={24} color="#fff" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, styles.primaryActionText]}>Record Infringement</Text>
            <Text style={[styles.actionDescription, styles.primaryActionSubtext]}>
              Capture a new traffic violation
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="list" size={24} color="#3b82f6" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>View History</Text>
            <Text style={styles.actionDescription}>
              See all records
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Location Info */}
      {location && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationCoords}>
              📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
            <Text style={styles.locationAccuracy}>
              Accuracy: ±{Math.round(location.accuracy || 0)}m
            </Text>
          </View>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greeting: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
  },
  logoutButton: {
    padding: 10,
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  online: {
    backgroundColor: '#E8F5E9',
  },
  offline: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  alertBox: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  alertText: {
    fontSize: 14,
    color: '#5A6C7D',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statCardPrimary: {
    backgroundColor: '#007AFF',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
    letterSpacing: -0.5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryAction: {
    backgroundColor: '#007AFF',
  },
  primaryActionIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryActionText: {
    color: '#FFFFFF',
  },
  primaryActionSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
    marginBottom: 0,
    flexDirection: 'column',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIconText: {
    fontSize: 28,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  actionArrow: {
    fontSize: 28,
    color: '#D1D1D6',
    fontWeight: '300',
  },
  locationCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  locationCoords: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  locationAccuracy: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
});
