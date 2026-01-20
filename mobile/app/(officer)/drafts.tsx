/**
 * MANTIS Mobile - Drafts Screen
 * 
 * View and manage saved draft infringements
 */

import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getDrafts, deleteDraft } from '@/lib/offline';
import { formatDate } from '@/lib/formatting';
import { LocalInfringement } from '@/lib';
import { queryKeys } from '@/lib/queryKeys';

export default function DraftsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const queryClient = useQueryClient();

  const {
    data: drafts = [],
    isPending: isLoading,
    isFetching: isRefreshing,
    refetch,
  } = useQuery({
    queryKey: queryKeys.drafts,
    queryFn: getDrafts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drafts });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete draft');
    },
  });

  const onRefresh = () => {
    refetch();
  };

  const handleDeleteDraft = (id: string) => {
    Alert.alert(
      'Delete Draft',
      'Are you sure you want to delete this draft? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            deleteMutation.mutate(id);
          },
        },
      ]
    );
  };

  const handleEditDraft = (draft: LocalInfringement) => {
    // Navigate to create screen with draft data as params
    router.push({
      pathname: '/(officer)/create',
      params: {
        draftId: draft.id,
        draftData: JSON.stringify(draft),
      },
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <ThemedText>Loading drafts...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (drafts.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <ThemedText type="title" style={styles.emptyIcon}>📝</ThemedText>
          <ThemedText type="subtitle" style={styles.emptyTitle}>No Drafts</ThemedText>
          <ThemedText style={styles.emptyText}>
            Saved drafts will appear here.{'\n'}
            Create a new infringement and save it as a draft.
          </ThemedText>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/(officer)/create')}
          >
            <ThemedText style={styles.buttonText}>Create Infringement</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Drafts</ThemedText>
          <ThemedText style={styles.count}>
            {drafts.length} draft{drafts.length !== 1 ? 's' : ''}
          </ThemedText>
        </View>

        {drafts.map((draft) => (
          <View key={draft.id} style={[styles.draftCard, { borderColor: colors.icon }]}>
            <View style={styles.draftHeader}>
              <View style={styles.draftInfo}>
                <ThemedText style={styles.draftId}>
                  Draft {draft.id.slice(0, 8)}
                </ThemedText>
                <ThemedText style={styles.draftDate}>
                  {formatDate(new Date(draft.created_at), 'short')}
                </ThemedText>
              </View>
              <View style={[styles.draftBadge, { backgroundColor: colors.tint + '20' }]}>
                <ThemedText style={[styles.badgeText, { color: colors.tint }]}>
                  DRAFT
                </ThemedText>
              </View>
            </View>

            {draft.data.offence_code && (
              <View style={styles.draftDetail}>
                <ThemedText style={styles.detailLabel}>Offence:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {draft.data.offence_code}
                </ThemedText>
              </View>
            )}

            {draft.data.description && (
              <View style={styles.draftDetail}>
                <ThemedText style={styles.detailLabel}>Description:</ThemedText>
                <ThemedText style={styles.detailValue} numberOfLines={2}>
                  {draft.data.description}
                </ThemedText>
              </View>
            )}

            {draft.data.location && (
              <View style={styles.draftDetail}>
                <ThemedText style={styles.detailLabel}>📍 Location captured</ThemedText>
              </View>
            )}

            {draft.photos && draft.photos.length > 0 && (
              <View style={styles.draftDetail}>
                <ThemedText style={styles.detailLabel}>
                  📷 {draft.photos.length} photo{draft.photos.length !== 1 ? 's' : ''}
                </ThemedText>
              </View>
            )}

            <View style={styles.draftActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.tint }]}
                onPress={() => handleEditDraft(draft)}
              >
                <ThemedText style={styles.actionButtonText}>Edit</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteDraft(draft.id)}
              >
                <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  count: {
    opacity: 0.7,
    marginTop: 4,
  },
  draftCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  draftInfo: {
    flex: 1,
  },
  draftId: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  draftDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  draftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  draftDetail: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
  },
  draftActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
