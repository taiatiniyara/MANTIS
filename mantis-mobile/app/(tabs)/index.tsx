import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function HomeScreen() {
  const { profile } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isOfficer =
    profile.role === "officer" || profile.role === "agency_admin";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{profile.full_name}</Text>
        </View>
        <View style={styles.logo}>
          <Text style={styles.logoText}>���</Text>
        </View>
      </View>

      {profile.agency && (
        <View style={styles.agencyBadge}>
          <Text style={styles.agencyText}>{profile.agency.name}</Text>
        </View>
      )}

      {isOfficer && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => router.push("/(tabs)/create-infringement")}
          >
            <IconSymbol name="plus.circle.fill" size={32} color="#fff" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Create Infringement</Text>
              <Text style={styles.actionSubtitle}>
                Issue a new traffic infringement
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>���</Text>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Infringements</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>���</Text>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Payments</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  greeting: { fontSize: 14, color: "#64748b" },
  name: { fontSize: 24, fontWeight: "bold", color: "#1e293b" },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 28 },
  agencyBadge: {
    backgroundColor: "#F97316",
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  agencyText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  section: { padding: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  primaryAction: {
    backgroundColor: "#F97316",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  actionContent: { flex: 1, marginLeft: 16 },
  actionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  actionSubtitle: { fontSize: 13, color: "#dbeafe" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  statLabel: { fontSize: 12, color: "#64748b" },
});
