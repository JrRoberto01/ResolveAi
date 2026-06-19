import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import {
  ApiNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../api/notifications.api';
import {
  ApiOccurrence,
  getOccurrence,
  toggleOccurrenceSupport,
} from '../../api/occurrences.api';
import { Header } from '../../components/Header';
import type { Ocorrencia } from '../../components/CardOcorrencia';
import { OccurrenceDetails } from '../../components/OccurrenceDetails';
import { colors } from '../../style/colors';
import { radii, spacing } from '../../style/spacing';

const statusLabels: Record<ApiOccurrence['status'], string> = {
  IN_ANALYSIS: 'EM ANÁLISE',
  RESOLVED: 'RESOLVIDO',
  REJECTED: 'REJEITADO',
};

function formatTimeAgo(date: string) {
  const createdAt = new Date(date).getTime();
  const diffInMinutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60000));

  if (diffInMinutes < 1) return 'Agora mesmo';
  if (diffInMinutes < 60) return `${diffInMinutes} min`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d`;
}

function getNotificationIcon(type: ApiNotification['type']) {
  if (type === 'SUPPORTED_OCCURRENCE_RESOLVED') return 'checkmark-circle-outline';
  if (type === 'OCCURRENCE_COMMENTED') return 'chatbubble-ellipses-outline';
  if (type === 'OCCURRENCE_SUPPORTED') return 'heart-outline';
  return 'shield-checkmark-outline';
}

function getNotificationAction(type: ApiNotification['type']) {
  if (type === 'OCCURRENCE_COMMENTED') return 'Ver comentário';
  if (type === 'SUPPORTED_OCCURRENCE_RESOLVED') return 'Ver ocorrência';
  if (type === 'OCCURRENCE_SUPPORTED') return 'Ver ocorrência';
  return null;
}

function apiOccurrenceToDetails(occurrence: ApiOccurrence): Ocorrencia {
  const hasLocation = occurrence.latitude !== null && occurrence.longitude !== null;
  const location = hasLocation
    ? {
        latitude: occurrence.latitude,
        longitude: occurrence.longitude,
        address: occurrence.address ?? undefined,
      }
    : occurrence.address ?? 'Local marcado no mapa';

  return {
    id: String(occurrence.id),
    title: occurrence.title,
    description: occurrence.description ?? '',
    category: occurrence.category,
    anonymous: occurrence.anonymous,
    location,
    likes: occurrence.supportCount,
    comments: occurrence.commentsCount,
    timeAgo: formatTimeAgo(occurrence.createdAt),
    status: statusLabels[occurrence.status],
    photos: occurrence.photos,
    imageUrl: occurrence.photos.length > 0 ? { uri: occurrence.photos[0] } : undefined,
    supportedByMe: occurrence.supportedByMe,
    canEdit: occurrence.canEdit,
  };
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState<Ocorrencia | null>(null);
  const [selectedNotificationType, setSelectedNotificationType] = useState<ApiNotification['type'] | null>(null);
  const [openingNotificationId, setOpeningNotificationId] = useState<number | null>(null);

  const loadNotifications = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setNotifications(await getNotifications());
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar notificacoes',
        text2: err?.friendlyMessage || err?.message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications]),
  );

  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsAsRead();
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          readAt: notification.readAt ?? new Date().toISOString(),
        })),
      );
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Nao foi possivel marcar como lidas',
        text2: err?.friendlyMessage || err?.message,
      });
    }
  }

  async function handleMarkNotificationAsRead(notification: ApiNotification) {
    if (notification.readAt) {
      return;
    }

    try {
      const updatedNotification = await markNotificationAsRead(notification.id);
      setNotifications((currentNotifications) =>
        currentNotifications.map((currentNotification) =>
          currentNotification.id === updatedNotification.id
            ? updatedNotification
            : currentNotification,
        ),
      );
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Nao foi possivel atualizar',
        text2: err?.friendlyMessage || err?.message,
      });
    }
  }

  async function handleOpenNotificationOccurrence(notification: ApiNotification) {
    if (openingNotificationId) {
      return;
    }

    try {
      setOpeningNotificationId(notification.id);

      await handleMarkNotificationAsRead(notification);

      if (!notification.occurrenceId) {
        return;
      }

      const occurrence = await getOccurrence(notification.occurrenceId);
      setSelectedOccurrence(apiOccurrenceToDetails(occurrence));
      setSelectedNotificationType(notification.type);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Nao foi possivel abrir a ocorrencia',
        text2: err?.friendlyMessage || err?.message,
      });
    } finally {
      setOpeningNotificationId(null);
    }
  }

  async function handleToggleSelectedSupport() {
    if (!selectedOccurrence) {
      return;
    }

    try {
      const result = await toggleOccurrenceSupport(Number(selectedOccurrence.id));
      const updatedOccurrence = apiOccurrenceToDetails(result.occurrence);

      setSelectedOccurrence(updatedOccurrence);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Nao foi possivel apoiar',
        text2: err?.friendlyMessage || err?.message,
      });
    }
  }

  const handleCommentCountChange = useCallback((occurrenceId: string, count: number) => {
    setSelectedOccurrence((currentOccurrence) =>
      currentOccurrence?.id === occurrenceId && currentOccurrence.comments !== count
        ? { ...currentOccurrence, comments: count }
        : currentOccurrence,
    );
  }, []);

  const handleOccurrenceChange = useCallback((updatedOccurrence: Ocorrencia) => {
    setSelectedOccurrence((currentOccurrence) =>
      currentOccurrence?.id === updatedOccurrence.id ? updatedOccurrence : currentOccurrence,
    );
  }, []);

  const hasUnread = notifications.some((notification) => !notification.readAt);

  if (selectedOccurrence) {
    return (
      <View style={styles.container}>
        <OccurrenceDetails
          occurrence={selectedOccurrence}
          isSupported={selectedOccurrence.supportedByMe}
          onBack={() => {
            setSelectedOccurrence(null);
            setSelectedNotificationType(null);
          }}
          onPressSupport={() => {
            void handleToggleSelectedSupport();
          }}
          onCommentCountChange={handleCommentCountChange}
          onOccurrenceChange={handleOccurrenceChange}
          focusComments={selectedNotificationType === 'OCCURRENCE_COMMENTED'}
        />
        <Toast position="top" bottomOffset={20} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Notificações" showBack onBack={() => router.back()} />

      <View style={styles.actionsContainer}>
        <Text style={styles.pageTitle}>Central de notificações</Text>
        {hasUnread ? (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.readAllButton}>
            <Ionicons name="checkmark-done-outline" size={18} color={colors.primary} />
            <Text style={styles.readAllText}>Marcar lidas</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          void loadNotifications(false);
        }}
        renderItem={({ item }) => {
          const isUnread = !item.readAt;
          const actionLabel = getNotificationAction(item.type);

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.notificationItem, isUnread ? styles.unreadItem : null]}
              onPress={() => {
                void handleMarkNotificationAsRead(item);
              }}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={getNotificationIcon(item.type)} size={22} color={colors.primary} />
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  {isUnread ? <View style={styles.unreadDot} /> : null}
                </View>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                {item.occurrence ? (
                  <Text style={styles.occurrenceHint}>{item.occurrence.title}</Text>
                ) : null}
                <View style={styles.notificationFooter}>
                  <Text style={styles.timeText}>{formatTimeAgo(item.createdAt)}</Text>
                  {actionLabel && item.occurrenceId ? (
                    <TouchableOpacity
                      style={styles.actionHint}
                      onPress={() => {
                        void handleOpenNotificationOccurrence(item);
                      }}
                      disabled={openingNotificationId === item.id}
                    >
                      {openingNotificationId === item.id ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <>
                          <Text style={styles.actionHintText}>{actionLabel}</Text>
                          <Ionicons name="chevron-forward" size={15} color={colors.primary} />
                        </>
                      )}
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <>
                <Ionicons name="notifications-off-outline" size={34} color={colors.textSecondary} />
                <Text style={styles.emptyTitle}>Nenhuma notificação por enquanto</Text>
                <Text style={styles.emptySubtitle}>
                  Atualizações importantes das suas ocorrências aparecem aqui.
                </Text>
              </>
            )}
          </View>
        }
      />

      <Toast position="top" bottomOffset={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  readAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  readAllText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  unreadItem: {
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  notificationTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notificationMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  occurrenceHint: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionHint: {
    minHeight: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionHintText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
