/**
 * MANTIS Mobile - Map Screen
 *
 * Location-based view of infringements with interactive OpenStreetMap
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
} from "react-native";
import * as Location from "expo-location";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getInfringements } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import { Infringement } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/formatting";
import OSMMap from "@/components/OSMMap";

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useAuth();

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [infringements, setInfringements] = useState<Infringement[]>([]);

  useEffect(() => {
    requestLocationPermission();
    loadInfringements();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);
      } else {
        Alert.alert(
          "Location Permission",
          "Location permission is required to show your current position on the map.",
        );
      }
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadInfringements = async () => {
    if (!user) return;

    try {
      const { data } = await getInfringements({
        officer_id: user.id,
        limit: 50,
      });

      if (data) {
        const withLocations = data.filter((inf) => inf.location);
        setInfringements(withLocations);
      }
    } catch (error) {
      console.error("Error loading infringements:", error);
    }
  };

  const parseGeoJSON = (
    location: string | null,
  ): { latitude: number; longitude: number } | null => {
    if (!location) return null;

    // Debug: Log the raw location data
    console.log("Raw location data:", location, "Type:", typeof location);

    // If location is already an object, handle it directly
    if (typeof location === "object") {
      const loc = location as any;
      if (loc.type === "Point" && loc.coordinates) {
        return {
          longitude: loc.coordinates[0],
          latitude: loc.coordinates[1],
        };
      }
    }

    // If it's a string, try parsing it
    if (typeof location === "string") {
      try {
        // Try parsing as JSON first (GeoJSON format)
        const parsed = JSON.parse(location);
        if (parsed.type === "Point" && parsed.coordinates) {
          return {
            longitude: parsed.coordinates[0],
            latitude: parsed.coordinates[1],
          };
        }
      } catch (error) {
        // If JSON parsing fails, try PostGIS format: SRID=4326;POINT(lon lat)
        const pointMatch = location.match(
          /POINT\s*\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*\)/i,
        );
        if (pointMatch) {
          return {
            longitude: parseFloat(pointMatch[1]),
            latitude: parseFloat(pointMatch[2]),
          };
        }
        console.error("Error parsing location string:", error);
      }
    }

    return null;
  };

  const openInGoogleMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
          <ThemedText>Loading location data...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Interactive OpenStreetMap */}
      <View style={styles.mapContainer}>
        <OSMMap
          initialLat={location?.coords.latitude ?? 37.7749}
          initialLng={location?.coords.longitude ?? -122.4194}
        />
      </View>

      {/* Scrollable Content Below Map */}
      <ScrollView style={styles.scrollContent}>
        <ThemedView style={styles.content}>
          {/* Current Location Card */}
          {location && (
            <View
              style={[
                styles.locationCard,
                { backgroundColor: colors.tint + "20" },
              ]}
            >
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardTitle}>
                  📍 Your Location
                </ThemedText>
                <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                  <ThemedText style={styles.badgeText}>CURRENT</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.coordinates}>
                Lat: {location.coords.latitude.toFixed(6)}
              </ThemedText>
              <ThemedText style={styles.coordinates}>
                Lon: {location.coords.longitude.toFixed(6)}
              </ThemedText>
              <View style={styles.mapButtons}>
                <TouchableOpacity
                  style={[styles.mapButton, { backgroundColor: colors.tint }]}
                  onPress={() =>
                    openInGoogleMaps(
                      location.coords.latitude,
                      location.coords.longitude,
                    )
                  }
                >
                  <ThemedText style={styles.mapButtonText}>
                    Open in Google Maps
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Infringements List */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Nearby Infringements</ThemedText>
              <ThemedText style={styles.count}>
                {infringements.length} case
                {infringements.length !== 1 ? "s" : ""}
              </ThemedText>
            </View>

            {infringements.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>
                  No infringements with location data found
                </ThemedText>
              </View>
            ) : (
              infringements.map((inf) => {
                const coords = parseGeoJSON(inf.location);
                if (!coords) return null;

                const statusColor =
                  inf.status === "draft"
                    ? "#8e8e93"
                    : inf.status === "pending"
                    ? "#ff9500"
                    : inf.status === "approved"
                    ? "#34c759"
                    : inf.status === "paid"
                    ? "#34c759"
                    : inf.status === "appealed"
                    ? "#007AFF"
                    : inf.status === "appeal_approved"
                    ? "#34c759"
                    : inf.status === "appeal_rejected"
                    ? "#ff3b30"
                    : inf.status === "cancelled"
                    ? "#ff3b30"
                    : inf.status === "overdue"
                    ? "#ff3b30"
                    : "#8e8e93";

                return (
                  <View
                    key={inf.id}
                    style={[
                      styles.infringementCard,
                      { borderColor: colors.icon },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardInfo}>
                        <ThemedText style={styles.caseId}>
                          Case {inf.id.slice(0, 8)}
                        </ThemedText>
                        <ThemedText style={styles.offenceCode}>
                          {inf.offence_code}
                        </ThemedText>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusColor + "20" },
                        ]}
                      >
                        <ThemedText
                          style={[styles.statusText, { color: statusColor }]}
                        >
                          {inf.status.toUpperCase()}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>
                        Amount:
                      </ThemedText>
                      <ThemedText style={styles.detailValue}>
                        {formatCurrency(inf.fine_amount)}
                      </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>
                        Location:
                      </ThemedText>
                      <ThemedText style={styles.detailValue}>
                        {coords.latitude.toFixed(4)},{" "}
                        {coords.longitude.toFixed(4)}
                      </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Date:</ThemedText>
                      <ThemedText style={styles.detailValue}>
                        {formatDate(inf.issued_at, "short")}
                      </ThemedText>
                    </View>

                    <View style={styles.mapButtons}>
                      <TouchableOpacity
                        style={[
                          styles.mapButton,
                          { backgroundColor: colors.tint },
                        ]}
                        onPress={() =>
                          openInGoogleMaps(coords.latitude, coords.longitude)
                        }
                      >
                        <ThemedText style={styles.mapButtonText}>
                          View on Map
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <ThemedText style={styles.infoTitle}>💡 About Map View</ThemedText>
            <ThemedText style={styles.infoText}>
              • Use the interactive map above to view and navigate to locations
            </ThemedText>
            <ThemedText style={styles.infoText}>
              • Enter coordinates manually or click on the map
            </ThemedText>
            <ThemedText style={styles.infoText}>
              • Tap "View on Map" to open specific locations in Google Maps
            </ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 450,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  locationCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  coordinates: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "monospace",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  count: {
    opacity: 0.7,
    fontSize: 14,
  },
  infringementCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  cardInfo: {
    flex: 1,
  },
  caseId: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  offenceCode: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  detailLabel: {
    opacity: 0.7,
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  mapButtons: {
    marginTop: 12,
  },
  mapButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  mapButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    opacity: 0.7,
    textAlign: "center",
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    gap: 8,
  },
  infoTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
});
