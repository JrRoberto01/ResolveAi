import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { getPublicProfile, type ProfileSummary, type PublicProfileAuthor } from '../../api/profile.api';
import {
  createOccurrenceComment,
  deleteOccurrenceComment,
  getOccurrenceComments,
  updateOccurrence,
  type ApiOccurrenceComment,
  type ApiOccurrence,
  updateOccurrenceComment,
} from '../../api/occurrences.api';
import { colors } from '../../style/colors';
import { styles as profileStyles } from '../../style/profile_style';
import { Header } from '../Header';
import type { Ocorrencia } from '../CardOcorrencia';
import { OccurrenceCard } from '../OccurrenceCard';
import { ProfileHeader } from '../ProfileHeader';
import { ProfileInfo } from '../ProfileInfo';
import { StatCard } from '../StatCard';
import { styles } from './OccurrenceDetailsStyle';

interface OccurrenceDetailsProps {
  occurrence: Ocorrencia;
  isSupported?: boolean;
  onBack: () => void;
  onPressSupport?: () => void;
  onCommentCountChange?: (occurrenceId: string, count: number) => void;
  onOccurrenceChange?: (occurrence: Ocorrencia) => void;
  focusComments?: boolean;
}

function getLocationText(location: Ocorrencia['location']) {
  if (typeof location === 'string') return location;
  return location?.address || 'Local marcado no mapa';
}

function getImageSource(occurrence: Ocorrencia) {
  if (occurrence.photos && occurrence.photos.length > 0) {
    return { uri: occurrence.photos[0] };
  }

  return occurrence.imageUrl || require('../../../assets/images/icon.png');
}

function getMapCoordinate(location: Ocorrencia['location']) {
  if (!location || typeof location !== 'object') {
    return null;
  }

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

function getInitials(name?: string) {
  if (!name) return 'VC';

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

  return initials.toUpperCase() || 'VC';
}

function formatCommentTime(date: string) {
  const createdAt = new Date(date).getTime();
  const diffInMinutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60000));

  if (diffInMinutes < 1) return 'Agora';
  if (diffInMinutes < 60) return `Há ${diffInMinutes}min`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Há ${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `Há ${diffInDays}d`;
}

function wasCommentEdited(comment: ApiOccurrenceComment) {
  const createdAt = new Date(comment.createdAt).getTime();
  const modifiedAt = new Date(comment.modifiedAt).getTime();

  return Number.isFinite(createdAt) && Number.isFinite(modifiedAt) && modifiedAt - createdAt > 1000;
}

const profileStatusLabels: Record<ProfileSummary['occurrences'][number]['status'], 'Em análise' | 'Resolvido' | 'Rejeitado'> = {
  IN_ANALYSIS: 'Em análise',
  RESOLVED: 'Resolvido',
  REJECTED: 'Rejeitado',
};

const publicOccurrenceDetailStatusLabels: Record<ProfileSummary['occurrences'][number]['status'], string> = {
  IN_ANALYSIS: 'EM ANÁLISE',
  RESOLVED: 'RESOLVIDO',
  REJECTED: 'REJEITADO',
};

const apiOccurrenceStatusLabels: Record<ApiOccurrence['status'], string> = {
  IN_ANALYSIS: 'EM ANÁLISE',
  RESOLVED: 'RESOLVIDO',
  REJECTED: 'REJEITADO',
};

function formatOccurrenceTimeAgo(date: string) {
  const createdAt = new Date(date).getTime();
  const diffInMinutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60000));

  if (diffInMinutes < 1) return 'Agora mesmo';
  if (diffInMinutes < 60) return `${diffInMinutes} min`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d`;
}

function formatProfileLocation(city?: string | null, state?: string | null) {
  return [city, state].filter(Boolean).join(', ') || undefined;
}

function formatProfileMemberSince(date?: string | null) {
  if (!date) {
    return undefined;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(parsedDate);

  return `Membro desde ${formattedDate}`;
}

function profileOccurrenceToDetails(profileOccurrence: ProfileSummary['occurrences'][number]): Ocorrencia {
  const hasLocation = profileOccurrence.latitude !== null && profileOccurrence.longitude !== null;
  const location = hasLocation
    ? {
      latitude: profileOccurrence.latitude,
      longitude: profileOccurrence.longitude,
      address: profileOccurrence.address ?? undefined,
    }
    : profileOccurrence.address ?? 'Local marcado no mapa';

  return {
    id: String(profileOccurrence.id),
    title: profileOccurrence.title,
    description: profileOccurrence.description ?? '',
    category: profileOccurrence.category,
    anonymous: profileOccurrence.anonymous,
    location,
    likes: profileOccurrence.supportCount,
    comments: profileOccurrence.commentsCount,
    timeAgo: formatOccurrenceTimeAgo(profileOccurrence.createdAt),
    status: publicOccurrenceDetailStatusLabels[profileOccurrence.status],
    photos: profileOccurrence.photos,
    imageUrl: profileOccurrence.photos.length > 0 ? { uri: profileOccurrence.photos[0] } : undefined,
    supportedByMe: profileOccurrence.supportedByMe,
    canEdit: profileOccurrence.canEdit,
  };
}

function apiOccurrenceToDetails(apiOccurrence: ApiOccurrence, fallback?: Ocorrencia): Ocorrencia {
  const hasLocation = apiOccurrence.latitude !== null && apiOccurrence.longitude !== null;
  const location = hasLocation
    ? {
      latitude: apiOccurrence.latitude,
      longitude: apiOccurrence.longitude,
      address: apiOccurrence.address ?? undefined,
    }
    : apiOccurrence.address ?? fallback?.location ?? 'Local marcado no mapa';

  return {
    id: String(apiOccurrence.id),
    title: apiOccurrence.title,
    description: apiOccurrence.description ?? '',
    category: apiOccurrence.category,
    anonymous: apiOccurrence.anonymous,
    location,
    likes: apiOccurrence.supportCount,
    comments: apiOccurrence.commentsCount,
    timeAgo: fallback?.timeAgo ?? formatOccurrenceTimeAgo(apiOccurrence.createdAt),
    status: apiOccurrenceStatusLabels[apiOccurrence.status],
    photos: apiOccurrence.photos,
    imageUrl: apiOccurrence.photos.length > 0 ? { uri: apiOccurrence.photos[0] } : fallback?.imageUrl,
    supportedByMe: apiOccurrence.supportedByMe,
    canEdit: apiOccurrence.canEdit,
  };
}

export function OccurrenceDetails({
  occurrence,
  isSupported = false,
  onBack,
  onPressSupport,
  onCommentCountChange,
  onOccurrenceChange,
  focusComments = false,
}: OccurrenceDetailsProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentOccurrence, setCurrentOccurrence] = useState(occurrence);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<ApiOccurrenceComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [sendingComment, setSendingComment] = useState(false);
  const [finalizingOccurrence, setFinalizingOccurrence] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [savingCommentId, setSavingCommentId] = useState<number | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [selectedAuthorProfile, setSelectedAuthorProfile] = useState<ProfileSummary | null>(null);
  const [selectedPublicOccurrence, setSelectedPublicOccurrence] = useState<Ocorrencia | null>(null);
  const [publicProfileLoading, setPublicProfileLoading] = useState(false);
  const [commentsSectionY, setCommentsSectionY] = useState<number | null>(null);
  const [showAllPublicOccurrences, setShowAllPublicOccurrences] = useState(false);
  const locationText = getLocationText(currentOccurrence.location);
  const mapCoordinate = getMapCoordinate(currentOccurrence.location);
  const isResolved = currentOccurrence.status?.toUpperCase() === 'RESOLVIDO';
  const canFinalizeOccurrence = !!currentOccurrence.canEdit && !isResolved;

  useEffect(() => {
    setCurrentOccurrence(occurrence);
  }, [occurrence]);

  useEffect(() => {
    let isMounted = true;

    async function loadComments() {
      try {
        setCommentsLoading(true);
        const loadedComments = await getOccurrenceComments(Number(currentOccurrence.id));

        if (isMounted) {
          setComments(loadedComments);
          onCommentCountChange?.(currentOccurrence.id, loadedComments.length);
        }
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: 'Não foi possível carregar comentários',
          text2: err?.friendlyMessage || err?.message,
        });
      } finally {
        if (isMounted) {
          setCommentsLoading(false);
        }
      }
    }

    void loadComments();

    return () => {
      isMounted = false;
    };
  }, [currentOccurrence.id, onCommentCountChange]);

  useEffect(() => {
    if (!focusComments || commentsSectionY === null || commentsLoading) {
      return;
    }

    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, commentsSectionY - 12),
        animated: true,
      });
    }, 250);

    return () => {
      clearTimeout(timeout);
    };
  }, [commentsLoading, commentsSectionY, focusComments]);

  async function handleSendComment() {
    const trimmedComment = commentText.trim();

    if (!trimmedComment || sendingComment) {
      return;
    }

    try {
      setSendingComment(true);
      const createdComment = await createOccurrenceComment(Number(currentOccurrence.id), trimmedComment);

      setComments((currentComments) => {
        const nextComments = [...currentComments, createdComment];
        onCommentCountChange?.(currentOccurrence.id, nextComments.length);
        return nextComments;
      });
      setCommentText('');
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Não foi possível comentar',
        text2: err?.friendlyMessage || err?.message,
      });
    } finally {
      setSendingComment(false);
    }
  }

  function startEditComment(comment: ApiOccurrenceComment) {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  }

  function cancelEditComment() {
    setEditingCommentId(null);
    setEditingCommentText('');
  }

  async function handleUpdateComment(commentId: number) {
    const trimmedComment = editingCommentText.trim();

    if (!trimmedComment || savingCommentId) {
      return;
    }

    try {
      setSavingCommentId(commentId);
      const updatedComment = await updateOccurrenceComment(Number(currentOccurrence.id), commentId, trimmedComment);
      setComments((currentComments) =>
        currentComments.map((comment) => (comment.id === commentId ? updatedComment : comment)),
      );
      cancelEditComment();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Não foi possível editar',
        text2: err?.friendlyMessage || err?.message,
      });
    } finally {
      setSavingCommentId(null);
    }
  }

  function confirmDeleteComment(commentId: number) {
    Alert.alert('Excluir comentário', 'Tem certeza que deseja excluir este comentário?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          void handleDeleteComment(commentId);
        },
      },
    ]);
  }

  async function handleDeleteComment(commentId: number) {
    if (deletingCommentId) {
      return;
    }

    try {
      setDeletingCommentId(commentId);
      await deleteOccurrenceComment(Number(currentOccurrence.id), commentId);
      setComments((currentComments) => {
        const nextComments = currentComments.filter((comment) => comment.id !== commentId);
        onCommentCountChange?.(currentOccurrence.id, nextComments.length);
        return nextComments;
      });

      if (editingCommentId === commentId) {
        cancelEditComment();
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Não foi possível excluir',
        text2: err?.friendlyMessage || err?.message,
      });
    } finally {
      setDeletingCommentId(null);
    }
  }

  function handleShare() {
    void Share.share({
      title: currentOccurrence.title,
      message: `${currentOccurrence.title}\n${currentOccurrence.description}\nLocalização: ${locationText}`,
    });
  }

  function confirmFinalizeOccurrence() {
    Alert.alert(
      'Finalizar ocorrência',
      'Deseja marcar esta ocorrência como resolvida?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: () => {
            void handleFinalizeOccurrence();
          },
        },
      ],
    );
  }

  async function handleFinalizeOccurrence() {
    if (!canFinalizeOccurrence || finalizingOccurrence) {
      return;
    }

    try {
      setFinalizingOccurrence(true);
      const updatedOccurrence = await updateOccurrence(Number(currentOccurrence.id), {
        status: 'RESOLVED',
      });
      const updatedDetails = apiOccurrenceToDetails(updatedOccurrence, currentOccurrence);

      setCurrentOccurrence(updatedDetails);
      onOccurrenceChange?.(updatedDetails);
      Toast.show({
        type: 'success',
        text1: 'Ocorrência finalizada',
        text2: 'O status foi alterado para resolvido.',
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Não foi possível finalizar',
        text2: err?.friendlyMessage || err?.message,
      });
    } finally {
      setFinalizingOccurrence(false);
    }
  }

  async function handleOpenAuthorProfile(author: PublicProfileAuthor) {
    try {
      setPublicProfileLoading(true);
      setSelectedPublicOccurrence(null);
      setSelectedAuthorProfile(await getPublicProfile(author));
      setShowAllPublicOccurrences(false);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Não foi possível carregar o perfil',
        text2: err?.friendlyMessage || err?.message,
      });
    } finally {
      setPublicProfileLoading(false);
    }
  }

  const totalComments = commentsLoading && comments.length === 0 ? occurrence.comments : comments.length;
  const publicProfileUser = selectedAuthorProfile?.user;
  const sortedPublicOccurrences = [...(selectedAuthorProfile?.occurrences ?? [])].sort(
    (firstOccurrence, secondOccurrence) =>
      new Date(secondOccurrence.createdAt).getTime() - new Date(firstOccurrence.createdAt).getTime(),
  );
  const visiblePublicOccurrences = showAllPublicOccurrences
    ? sortedPublicOccurrences
    : sortedPublicOccurrences.slice(0, 2);
  const hasMorePublicOccurrences = sortedPublicOccurrences.length > 2;

  if (publicProfileLoading) {
    return (
      <SafeAreaView style={profileStyles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={profileStyles.scrollContent}>
          <ProfileHeader title="Perfil" showBack showShare={false} onBack={() => setPublicProfileLoading(false)} />
          <View style={profileStyles.loadingContainer}>
            <ActivityIndicator />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (selectedAuthorProfile) {
    if (selectedPublicOccurrence) {
      return (
        <OccurrenceDetails
          occurrence={selectedPublicOccurrence}
          isSupported={selectedPublicOccurrence.supportedByMe}
          onBack={() => setSelectedPublicOccurrence(null)}
          onOccurrenceChange={setSelectedPublicOccurrence}
        />
      );
    }

    return (
      <SafeAreaView style={profileStyles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={profileStyles.scrollContent}>
          <ProfileHeader title="Perfil" showBack showShare={false} onBack={() => setSelectedAuthorProfile(null)} />

          <ProfileInfo
            avatarUrl={publicProfileUser?.image}
            name={publicProfileUser?.name ?? 'Usuário'}
            location={formatProfileLocation(publicProfileUser?.city, publicProfileUser?.state)}
            memberSince={formatProfileMemberSince(publicProfileUser?.createdAt)}
          />

          <View style={profileStyles.statsContainer}>
            <StatCard number={String(selectedAuthorProfile.stats.occurrences)} label="OCORRÊNCIAS" />
            <StatCard number={String(selectedAuthorProfile.stats.supports)} label="APOIOS" />
          </View>

          <View style={profileStyles.sectionContainer}>
            <View style={profileStyles.sectionHeader}>
              <Text style={profileStyles.sectionTitle}>Ocorrências</Text>
              {hasMorePublicOccurrences ? (
                <TouchableOpacity onPress={() => setShowAllPublicOccurrences((currentValue) => !currentValue)}>
                  <Text style={profileStyles.seeAllText}>
                    {showAllPublicOccurrences ? 'Ver menos' : 'Ver tudo'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {visiblePublicOccurrences.length ? (
              visiblePublicOccurrences.map((profileOccurrence) => (
                <OccurrenceCard
                  key={profileOccurrence.id}
                  imageUrl={profileOccurrence.photos[0]}
                  title={profileOccurrence.title}
                  subtitle={`${formatOccurrenceTimeAgo(profileOccurrence.createdAt)} • ${profileOccurrence.category}`}
                  status={profileStatusLabels[profileOccurrence.status]}
                  onPress={() => setSelectedPublicOccurrence(profileOccurrenceToDetails(profileOccurrence))}
                />
              ))
            ) : (
              <Text style={profileStyles.emptyStateText}>Nenhuma ocorrência criada por este usuário.</Text>
            )}
          </View>

          <View style={profileStyles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Detalhes" showBack onBack={onBack} />

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={getImageSource(currentOccurrence)} style={styles.coverImage} resizeMode="cover" />

        <View
          style={styles.section}
          onLayout={(event) => {
            setCommentsSectionY(event.nativeEvent.layout.y);
          }}
        >
          <View style={styles.chipRow}>
            <View style={styles.statusChip}>
              <Text style={styles.statusText}>{currentOccurrence.status || 'EM ANÁLISE'}</Text>
            </View>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{currentOccurrence.category}</Text>
            </View>
          </View>

          <Text style={styles.title}>{currentOccurrence.title}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}> {locationText}</Text>
            <Text style={styles.metaDot}>-</Text>
            <Text style={styles.metaText}>Postado {currentOccurrence.timeAgo}</Text>
          </View>

          <Text style={styles.description}>{currentOccurrence.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização exata</Text>
          {mapCoordinate ? (
            <View style={styles.mapPreview}>
              <MapView
                style={styles.map}
                region={{
                  ...mapCoordinate,
                  latitudeDelta: 0.0008,
                  longitudeDelta: 0.0008,
                }}
                scrollEnabled={false}
                zoomEnabled
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker coordinate={mapCoordinate} title={currentOccurrence.title} description={locationText} />
              </MapView>
            </View>
          ) : (
            <View style={styles.mapUnavailable}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.mapUnavailableText}>Localização exata não disponível para esta ocorrência.</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.countButton}>
            <Ionicons name={isSupported ? 'thumbs-up' : 'thumbs-up-outline'} size={18} color={colors.primary} />
            <Text style={styles.countText}>{currentOccurrence.likes}</Text>
          </View>
          <View style={styles.countButton}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.countText}>{totalComments}</Text>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
            <Ionicons name="share-social-outline" size={15} color={colors.text} />
            <Text style={styles.shareText}>Compartilhar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.supportButton} onPress={onPressSupport} activeOpacity={0.86}>
          <Ionicons name={isSupported ? 'checkmark-circle-outline' : 'hand-left-outline'} size={18} color={colors.surface} />
          <Text style={styles.supportText}>{isSupported ? 'Ocorrencia apoiada' : 'Apoiar a ocorrência'}</Text>
        </TouchableOpacity>

        {canFinalizeOccurrence ? (
          <TouchableOpacity
            style={[styles.finalizeButton, finalizingOccurrence ? styles.finalizeButtonDisabled : null]}
            onPress={confirmFinalizeOccurrence}
            disabled={finalizingOccurrence}
            activeOpacity={0.86}
          >
            {finalizingOccurrence ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="checkmark-done-outline" size={18} color={colors.primary} />
            )}
            <Text style={styles.finalizeText}>
              {finalizingOccurrence ? 'Finalizando...' : 'Marcar como finalizada'}
            </Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comentários da Comunidade</Text>
          {commentsLoading ? (
            <View style={styles.commentsState}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.commentsStateText}>Carregando comentários...</Text>
            </View>
          ) : null}

          {!commentsLoading && comments.length === 0 ? (
            <View style={styles.commentsState}>
              <Text style={styles.commentsStateText}>Nenhum comentário ainda.</Text>
            </View>
          ) : null}

          {comments.map((comment) => {
            const authorName = comment.author?.name || 'Morador';
            const initials = getInitials(authorName);
            const isEditing = editingCommentId === comment.id;
            const edited = wasCommentEdited(comment);

            return (
              <View key={comment.id} style={styles.commentCard}>
                <TouchableOpacity
                  onPress={() => {
                    void handleOpenAuthorProfile({
                      id: comment.author.id,
                      name: authorName,
                      image: comment.author.image,
                    });
                  }}
                  activeOpacity={0.75}
                >
                  {comment.author?.image ? (
                    <Image source={{ uri: comment.author.image }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarInitials}>
                      <Text style={styles.avatarInitialsText}>{initials}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.commentBubble}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{authorName}</Text>
                    <Text style={styles.commentTime}>
                      {formatCommentTime(comment.createdAt)}
                      {edited ? ' - Editado' : ''}
                    </Text>
                  </View>
                  {isEditing ? (
                    <>
                      <TextInput
                        style={styles.editCommentInput}
                        value={editingCommentText}
                        onChangeText={setEditingCommentText}
                        multiline
                        autoFocus
                      />
                      <View style={styles.commentActionsRow}>
                        <TouchableOpacity
                          style={styles.commentTextButton}
                          onPress={cancelEditComment}
                          disabled={savingCommentId === comment.id}
                        >
                          <Text style={styles.commentTextButtonLabel}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.commentTextButton, styles.commentTextButtonPrimary]}
                          onPress={() => {
                            void handleUpdateComment(comment.id);
                          }}
                          disabled={savingCommentId === comment.id}
                        >
                          {savingCommentId === comment.id ? (
                            <ActivityIndicator size="small" color={colors.surface} />
                          ) : (
                            <Text style={styles.commentTextButtonPrimaryLabel}>Salvar</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.commentText}>{comment.content}</Text>
                      {comment.canEdit ? (
                        <View style={styles.commentActionsRow}>
                          <TouchableOpacity style={styles.commentIconButton} onPress={() => startEditComment(comment)}>
                            <Ionicons name="create-outline" size={16} color={colors.primary} />
                            <Text style={styles.commentIconButtonText}>Editar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.commentIconButton}
                            onPress={() => confirmDeleteComment(comment.id)}
                            disabled={deletingCommentId === comment.id}
                          >
                            {deletingCommentId === comment.id ? (
                              <ActivityIndicator size="small" color={colors.error} />
                            ) : (
                              <Ionicons name="trash-outline" size={16} color={colors.error} />
                            )}
                            <Text style={[styles.commentIconButtonText, styles.commentIconButtonDangerText]}>
                              Excluir
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </>
                  )}
                </View>
              </View>
            );
          })}

          <View style={styles.inputRow}>
            <View style={styles.avatarInitials}>
              <Text style={styles.avatarInitialsText}>VC</Text>
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Escreva um comentário..."
              placeholderTextColor={colors.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, commentText.trim() ? styles.sendButtonActive : null]}
              onPress={() => {
                void handleSendComment();
              }}
              disabled={sendingComment}
              activeOpacity={0.8}
            >
              {sendingComment ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <Ionicons name="send" size={17} color={commentText.trim() ? colors.surface : colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
