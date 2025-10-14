import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface EvidenceViewerProps {
  evidenceUrls: string[];
}

export default function EvidenceViewer({ evidenceUrls }: EvidenceViewerProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  if (!evidenceUrls || evidenceUrls.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="image-outline" size={48} color="#cbd5e1" />
        <Text style={styles.emptyText}>No evidence photos available</Text>
      </View>
    );
  }

  const openFullScreen = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeFullScreen = () => {
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;

    if (direction === 'prev') {
      setSelectedImageIndex((prev) =>
        prev === null || prev === 0 ? evidenceUrls.length - 1 : prev - 1
      );
    } else {
      setSelectedImageIndex((prev) =>
        prev === null || prev === evidenceUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Thumbnail Gallery */}
      <View style={styles.galleryHeader}>
        <Ionicons name="images" size={20} color="#64748b" />
        <Text style={styles.galleryTitle}>
          Evidence Photos ({evidenceUrls.length})
        </Text>
      </View>

      <FlatList
        data={evidenceUrls}
        horizontal
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.thumbnailContainer}
            onPress={() => openFullScreen(index)}>
            <Image source={{ uri: item }} style={styles.thumbnail} />
            <View style={styles.thumbnailOverlay}>
              <Ionicons name="expand" size={20} color="white" />
            </View>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.galleryList}
      />

      {/* Full Screen Viewer */}
      {selectedImageIndex !== null && (
        <Modal
          visible={true}
          transparent={false}
          animationType="fade"
          onRequestClose={closeFullScreen}>
          <StatusBar hidden />
          <View style={styles.fullScreenContainer}>
            <SafeAreaView style={styles.fullScreenSafeArea}>
              {/* Header */}
              <View style={styles.fullScreenHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeFullScreen}>
                  <Ionicons name="close" size={32} color="white" />
                </TouchableOpacity>
                <Text style={styles.imageCounter}>
                  {selectedImageIndex + 1} / {evidenceUrls.length}
                </Text>
                <View style={styles.headerSpacer} />
              </View>

              {/* Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: evidenceUrls[selectedImageIndex] }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              </View>

              {/* Navigation */}
              {evidenceUrls.length > 1 && (
                <View style={styles.navigationContainer}>
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigateImage('prev')}>
                    <Ionicons name="chevron-back" size={32} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigateImage('next')}>
                    <Ionicons name="chevron-forward" size={32} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </SafeAreaView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  galleryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  galleryList: {
    paddingBottom: 8,
  },
  thumbnailContainer: {
    marginRight: 12,
    position: 'relative',
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  fullScreenSafeArea: {
    flex: 1,
  },
  fullScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  imageCounter: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 48,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height * 0.8,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  navButton: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
});
