import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { infringements, storage, supabase } from "@/lib/supabase";
import { router } from "expo-router";

interface Infringement {
  id: string;
  vehicle_id: string;
  vehicle_type?: "car" | "motorcycle" | "truck" | "bus" | "other";
  infringement_type_id: string;
  status?: "pending" | "paid" | "disputed" | "cancelled";
  latitude?: number;
  longitude?: number;
  notes: string | null;
  description?: string | null;
  created_at: string;
  type?: {
    code: string;
    name: string;
    fine_amount?: number;
    category?: {
      name: string;
    };
  };
  infringement_type?: {
    code: string;
    description: string;
  };
}

type FilterStatus = "all" | "pending" | "paid" | "disputed" | "cancelled";

export default function InfringementsScreen() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<Infringement[]>([]);
  const [filteredData, setFilteredData] = useState<Infringement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [selectedInfringement, setSelectedInfringement] =
    useState<Infringement | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

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
      const { data: infringementData, error } = await infringements.list(
        profile.id,
        100
      );

      if (error) {
        console.error("Error loading infringements:", error);
        Alert.alert("Error", "Failed to load infringements");
        return;
      }

      setData(infringementData || []);
    } catch (err) {
      console.error("Exception loading infringements:", err);
      Alert.alert("Error", "An unexpected error occurred");
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

    if (statusFilter !== "all") {
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
        .from("evidence-photos")
        .list("", {
          search: infringementId,
        });

      if (error) {
        console.error("Error listing photos:", error);
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
      console.error("Exception loading photos:", err);
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
      case "pending":
        return "#FF9500";
      case "paid":
        return "#34C759";
      case "disputed":
        return "#FF3B30";
      case "cancelled":
        return "#8E8E93";
      default:
        return "#007AFF";
    }
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { size: 14, color: "#666" };
    switch (status) {
      case "all":
        return <Ionicons name="list" {...iconProps} />;
      case "pending":
        return <Ionicons name="time" {...iconProps} />;
      case "paid":
        return <Ionicons name="checkmark-circle" {...iconProps} />;
      case "disputed":
        return <Ionicons name="warning" {...iconProps} />;
      case "cancelled":
        return <Ionicons name="close-circle" {...iconProps} />;
      default:
        return <Ionicons name="list" {...iconProps} />;
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
          isActive && {
            backgroundColor: statusColor,
            borderColor: statusColor,
          },
        ]}
        onPress={() => setStatusFilter(value as any)}
      >
        <View style={styles.filterIconContainer}>{getStatusIcon(value)}</View>
        <Text
          style={[
            styles.filterChipText,
            isActive && styles.filterChipTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const getVehicleIcon = (type: string) => {
    const iconProps = { size: 24, color: "#3b82f6" };
    switch (type) {
      case "car":
        return <Ionicons name="car" {...iconProps} />;
      case "motorcycle":
        return <Ionicons name="bicycle" {...iconProps} />;
      case "truck":
        return <MaterialIcons name="local-shipping" {...iconProps} />;
      case "bus":
        return <Ionicons name="bus" {...iconProps} />;
      default:
        return <Ionicons name="car" {...iconProps} />;
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
            <View style={styles.vehicleIconContainer}>
              {getVehicleIcon(item.vehicle_type || "other")}
            </View>
            <View>
              <Text style={styles.vehicleId}>{item.vehicle_id}</Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status || "pending") },
            ]}
          >
            <Text style={styles.statusText}>
              {(item.status || "pending").toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Infringement type */}
        <View style={styles.infringementType}>
          <Text style={styles.infringementCode}>
            {item.type?.code || "N/A"}
          </Text>
          <Text style={styles.infringementDescription}>
            {item.type?.name || "No description available"}
          </Text>
        </View>

        {/* Date and Fine */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons
              name="time-outline"
              size={16}
              color="#8E8E93"
              style={styles.detailIcon}
            />
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
        {searchQuery || statusFilter !== "all" ? (
          <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
        ) : (
          <>
            <Text style={styles.emptySubtext}>
              Start recording infringements
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/(tabs)/infringement")}
            >
              <Text style={styles.emptyButtonText}>New Infringement</Text>
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
        <SafeAreaView style={styles.modalContainer} edges={["top"]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Infringement Details</Text>
              <Text style={styles.modalSubtitle}>
                {selectedInfringement.vehicle_id}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Status Badge */}
            <View
              style={[
                styles.modalStatusBadge,
                {
                  backgroundColor: getStatusColor(
                    selectedInfringement.status || "pending"
                  ),
                },
              ]}
            >
              <Text style={styles.modalStatusText}>
                {(selectedInfringement.status || "pending").toUpperCase()}
              </Text>
            </View>

            {/* Compact Info Card */}
            <View style={styles.modalDetailCard}>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelWithIcon}>
                  <Ionicons name="car-outline" size={16} color="#666" />
                  <Text style={styles.detailLabel}> Vehicle</Text>
                </View>
                <Text style={styles.detailValue}>
                  {selectedInfringement.vehicle_id}
                </Text>
              </View>

              {selectedInfringement.vehicle_type && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>
                    {selectedInfringement.vehicle_type}
                  </Text>
                </View>
              )}

              <View style={styles.dividerLine} />

              <View style={styles.detailRow}>
                <View style={styles.detailLabelWithIcon}>
                  <Ionicons name="warning-outline" size={16} color="#666" />
                  <Text style={styles.detailLabel}> Violation</Text>
                </View>
                <Text style={styles.detailValue}>
                  {selectedInfringement.type?.code || "N/A"}
                </Text>
              </View>

              <Text style={styles.violationDesc}>
                {selectedInfringement.type?.name || "No description"}
              </Text>

              {selectedInfringement.description && (
                <>
                  <View style={styles.dividerLine} />
                  <View style={styles.detailLabelWithIcon}>
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="#666"
                    />
                    <Text style={styles.detailLabel}> Summary</Text>
                  </View>
                  <Text style={styles.notesText}>
                    {selectedInfringement.description}
                  </Text>
                </>
              )}

              <View style={styles.dividerLine} />

              <View style={styles.detailRow}>
                <View style={styles.detailLabelWithIcon}>
                  <Ionicons name="cash-outline" size={16} color="#666" />
                  <Text style={styles.detailLabel}> Fine</Text>
                </View>
                <Text style={styles.detailValueHighlight}>
                  $ {(selectedInfringement.type?.fine_amount || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.dividerLine} />

              <View style={styles.detailRow}>
                <View style={styles.detailLabelWithIcon}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.detailLabel}> Location</Text>
                </View>
                <Text style={styles.detailValue}>
                  {(selectedInfringement.latitude || 0).toFixed(4)},{" "}
                  {(selectedInfringement.longitude || 0).toFixed(4)}
                </Text>
              </View>

              <View style={styles.dividerLine} />

              <View style={styles.detailRow}>
                <View style={styles.detailLabelWithIcon}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.detailLabel}> Time</Text>
                </View>
                <Text style={styles.detailValue}>
                  {new Date(selectedInfringement.created_at).toLocaleString(
                    "en-FJ",
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </Text>
              </View>

              {selectedInfringement.notes && (
                <>
                  <View style={styles.dividerLine} />
                  <View style={styles.detailLabelWithIcon}>
                    <Ionicons name="create-outline" size={16} color="#666" />
                    <Text style={styles.detailLabel}> Notes</Text>
                  </View>
                  <Text style={styles.notesText}>
                    {selectedInfringement.notes}
                  </Text>
                </>
              )}
            </View>

            {/* Photos */}
            {(loadingPhotos || photoUrls.length > 0) && (
              <View style={styles.photoSection}>
                <View style={styles.photoSectionHeader}>
                  <Ionicons name="camera-outline" size={18} color="#2C3E50" />
                  <Text style={styles.photoSectionTitle}> Photos</Text>
                </View>
                {loadingPhotos ? (
                  <View style={styles.loadingPhotosContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingPhotosText}>Loading...</Text>
                  </View>
                ) : photoUrls.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {photoUrls.map((url, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.photoThumb}
                        onPress={() => {
                          setSelectedPhotoIndex(index);
                          setShowPhotoViewer(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: url }}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                        />
                        <View style={styles.photoOverlay}>
                          <Ionicons name="search" size={20} color="#FFF" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : null}
              </View>
            )}

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
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Compact Header */}
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredData.length}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#8E8E93"
          style={styles.searchIcon}
        />
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
        {renderFilterChip("All", "all")}
        {renderFilterChip("Pending", "pending")}
        {renderFilterChip("Paid", "paid")}
        {renderFilterChip("Disputed", "disputed")}
        {renderFilterChip("Cancelled", "cancelled")}
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

      {/* Photo Viewer Modal */}
      <Modal
        visible={showPhotoViewer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPhotoViewer(false)}
      >
        <View style={styles.photoViewerContainer}>
          <TouchableOpacity
            style={styles.photoViewerClose}
            onPress={() => setShowPhotoViewer(false)}
            activeOpacity={0.9}
          >
            <View style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFF" />
            </View>
          </TouchableOpacity>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.photoViewerScroll}
            contentOffset={{
              x: selectedPhotoIndex * Dimensions.get("window").width,
              y: 0,
            }}
          >
            {photoUrls.map((url, index) => (
              <View key={index} style={styles.photoViewerPage}>
                <Image
                  source={{ uri: url }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {photoUrls.length > 1 && (
            <View style={styles.photoCounter}>
              <Text style={styles.photoCounterText}>
                {selectedPhotoIndex + 1} / {photoUrls.length}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 40,
    alignItems: "center",
  },
  countText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    position: "absolute",
    left: 32,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 42,
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 15,
    color: "#000",
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
    height: 60,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F5F7FA",
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    marginRight: 8,
  },
  filterIconContainer: {
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  vehicleIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  vehicleIconContainer: {
    marginRight: 4,
  },
  vehicleId: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  vehicleType: {
    fontSize: 13,
    color: "#8E8E93",
    textTransform: "capitalize",
    fontWeight: "500",
  },
  statusBadge: {
    padding: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: "center",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  infringementType: {
    marginBottom: 16,
  },
  infringementCode: {
    fontSize: 12,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infringementDescription: {
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 20,
  },
  fineContainer: {
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fineLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E7D32",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fineAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E7D32",
    letterSpacing: -0.5,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    minHeight: 28,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: "#5A6C7D",
    lineHeight: 20,
  },
  cardFineRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  cardFineAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#8E8E93",
    marginBottom: 24,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#007AFF",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 4,
    opacity: 0.9,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalStatusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  modalStatusText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    lineHeight: 22,
  },
  detailLabelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    textAlign: "right",
    lineHeight: 22,
    flexShrink: 1,
    marginLeft: 16,
  },
  detailValueHighlight: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E7D32",
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 16,
  },
  violationDesc: {
    fontSize: 13,
    color: "#555",
    marginTop: -8,
    marginBottom: 10,
    lineHeight: 20,
    paddingLeft: 4,
  },
  notesText: {
    fontSize: 13,
    color: "#333",
    marginTop: 8,
    lineHeight: 21,
    paddingLeft: 4,
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginVertical: 16,
  },
  photoSection: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  photoSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 14,
  },
  photoSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  loadingPhotosContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  loadingPhotosText: {
    marginTop: 10,
    fontSize: 13,
    color: "#666",
  },
  photoThumb: {
    marginRight: 14,
  },
  thumbnailImage: {
    width: 160,
    height: 160,
    borderRadius: 10,
  },
  photoOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: 20,
    padding: 8,
  },
  photoExpandIcon: {
    fontSize: 16,
  },
  modalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  modalDetailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    flex: 0.4,
  },
  modalDetailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    flex: 0.6,
    textAlign: "right",
  },
  modalDetailValueHighlight: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2E7D32",
    flex: 0.6,
    textAlign: "right",
  },
  modalViolationDesc: {
    fontSize: 12,
    color: "#666",
    marginTop: -6,
    marginBottom: 6,
    lineHeight: 17,
  },
  modalNotesText: {
    fontSize: 13,
    color: "#333",
    marginTop: 6,
    lineHeight: 19,
  },
  modalDividerLine: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginVertical: 10,
  },
  modalPhotoSection: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  modalPhotoSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 12,
  },
  modalLoadingPhotosContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  modalLoadingPhotosText: {
    marginTop: 8,
    fontSize: 13,
    color: "#666",
  },
  modalPhotoThumb: {
    marginRight: 12,
  },
  modalThumbnailImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  modalPhotoOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 6,
  },
  modalPhotoExpandIcon: {
    fontSize: 14,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 12,
  },
  modalDetailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  modalPhotoPlaceholder: {
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  photoViewerContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  photoViewerClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  photoViewerScroll: {
    flex: 1,
    width: "100%",
  },
  photoViewerPage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  photoCounter: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  photoCounterText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
