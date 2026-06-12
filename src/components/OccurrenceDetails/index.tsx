import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
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
import Toast from 'react-native-toast-message';
import {
  createOccurrenceComment,
  deleteOccurrenceComment,
  getOccurrenceComments,
  type ApiOccurrenceComment,
  updateOccurrenceComment,
} from '../../api/occurrences.api';
import { colors } from '../../style/colors';
import { Header } from '../Header';
import type { Ocorrencia } from '../CardOcorrencia';
import { styles } from './OccurrenceDetailsStyle';

type TimelineItem = {
  id: string;
  title: string;
  meta: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'warning' | 'primary';
};

interface OccurrenceDetailsProps {
  occurrence: Ocorrencia;
  isSupported?: boolean;
  onBack: () => void;
  onPressSupport?: () => void;
  onCommentCountChange?: (occurrenceId: string, count: number) => void;
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
  if (diffInMinutes < 60) return `Ha ${diffInMinutes}min`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Ha ${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `Ha ${diffInDays}d`;
}

function wasCommentEdited(comment: ApiOccurrenceComment) {
  const createdAt = new Date(comment.createdAt).getTime();
  const modifiedAt = new Date(comment.modifiedAt).getTime();

  return Number.isFinite(createdAt) && Number.isFinite(modifiedAt) && modifiedAt - createdAt > 1000;
}

export function OccurrenceDetails({
  occurrence,
  isSupported = false,
  onBack,
  onPressSupport,
  onCommentCountChange,
}: OccurrenceDetailsProps) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<ApiOccurrenceComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [sendingComment, setSendingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [savingCommentId, setSavingCommentId] = useState<number | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const locationText = getLocationText(occurrence.location);

  useEffect(() => {
    let isMounted = true;

    async function loadComments() {
      try {
        setCommentsLoading(true);
        const loadedComments = await getOccurrenceComments(Number(occurrence.id));

        if (isMounted) {
          setComments(loadedComments);
          onCommentCountChange?.(occurrence.id, loadedComments.length);
        }
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: 'Nao foi possivel carregar comentarios',
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
  }, [occurrence.id, onCommentCountChange]);

  const timeline = useMemo<TimelineItem[]>(
    () => [
      {
        id: 'analysis',
        title: occurrence.status === 'RESOLVIDO' ? 'Resolvido' : 'Em analise',
        meta: 'Ha 30 minutos - Prefeitura',
        description:
          occurrence.status === 'RESOLVIDO'
            ? 'A equipe informou que o problema foi resolvido.'
            : 'A solicitacao foi encaminhada para a Secretaria de Obras.',
        icon: occurrence.status === 'RESOLVIDO' ? 'checkmark' : 'hourglass-outline',
        tone: occurrence.status === 'RESOLVIDO' ? 'primary' : 'warning',
      },
      {
        id: 'posted',
        title: 'Postado',
        meta: `${occurrence.timeAgo} - Por Voce`,
        description: 'A ocorrencia foi registrada e ja pode receber apoio da comunidade.',
        icon: 'megaphone-outline',
        tone: 'primary',
      },
    ],
    [occurrence.status, occurrence.timeAgo],
  );

  async function handleSendComment() {
    const trimmedComment = commentText.trim();

    if (!trimmedComment || sendingComment) {
      return;
    }

    try {
      setSendingComment(true);
      const createdComment = await createOccurrenceComment(Number(occurrence.id), trimmedComment);

      setComments((currentComments) => {
        const nextComments = [...currentComments, createdComment];
        onCommentCountChange?.(occurrence.id, nextComments.length);
        return nextComments;
      });
      setCommentText('');
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Nao foi possivel comentar',
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
      const updatedComment = await updateOccurrenceComment(Number(occurrence.id), commentId, trimmedComment);
      setComments((currentComments) =>
        currentComments.map((comment) => (comment.id === commentId ? updatedComment : comment)),
      );
      cancelEditComment();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Nao foi possivel editar',
        text2: err?.friendlyMessage || err?.message,
      });
    } finally {
      setSavingCommentId(null);
    }
  }

  function confirmDeleteComment(commentId: number) {
    Alert.alert('Excluir comentario', 'Tem certeza que deseja excluir este comentario?', [
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
      await deleteOccurrenceComment(Number(occurrence.id), commentId);
      setComments((currentComments) => {
        const nextComments = currentComments.filter((comment) => comment.id !== commentId);
        onCommentCountChange?.(occurrence.id, nextComments.length);
        return nextComments;
      });

      if (editingCommentId === commentId) {
        cancelEditComment();
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Nao foi possivel excluir',
        text2: err?.friendlyMessage || err?.message,
      });
    } finally {
      setDeletingCommentId(null);
    }
  }

  function handleShare() {
    void Share.share({
      title: occurrence.title,
      message: `${occurrence.title}\n${occurrence.description}\nLocalizacao: ${locationText}`,
    });
  }

  const totalComments = commentsLoading && comments.length === 0 ? occurrence.comments : comments.length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Detalhes" showBack onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={getImageSource(occurrence)} style={styles.coverImage} resizeMode="cover" />

        <View style={styles.section}>
          <View style={styles.chipRow}>
            <View style={styles.statusChip}>
              <Text style={styles.statusText}>{occurrence.status || 'EM ANALISE'}</Text>
            </View>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{occurrence.category}</Text>
            </View>
          </View>

          <Text style={styles.title}>{occurrence.title}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}> {locationText}</Text>
            <Text style={styles.metaDot}>-</Text>
            <Text style={styles.metaText}>Postado {occurrence.timeAgo}</Text>
          </View>

          <Text style={styles.description}>{occurrence.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localizacao exata</Text>
          <View style={styles.mapPreview}>
            <View style={styles.mapBase} />
            <View style={styles.mapPatchOne} />
            <View style={styles.mapPatchTwo} />
            <View style={styles.roadPrimary} />
            <View style={styles.roadSecondary} />
            <View style={styles.roadThin} />
            <View style={styles.mapPin}>
              <Ionicons name="location" size={19} color={colors.primary} />
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.countButton}>
            <Ionicons name={isSupported ? 'thumbs-up' : 'thumbs-up-outline'} size={18} color={colors.primary} />
            <Text style={styles.countText}>{occurrence.likes}</Text>
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
          <Text style={styles.supportText}>{isSupported ? 'Ocorrencia apoiada' : 'Apoiar a ocorrencia'}</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linha do tempo</Text>
          {timeline.map((item, index) => {
            const toneColor = item.tone === 'warning' ? '#F59E0B' : colors.primary;

            return (
              <View key={item.id} style={styles.timelineItem}>
                <View style={styles.timelineTrack}>
                  <View style={[styles.timelineIcon, { borderColor: toneColor, backgroundColor: `${toneColor}1A` }]}>
                    <Ionicons name={item.icon} size={12} color={toneColor} />
                  </View>
                  {index < timeline.length - 1 ? <View style={styles.timelineLine} /> : null}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>{item.title}</Text>
                  <Text style={styles.timelineMeta}>{item.meta}</Text>
                  <Text style={styles.timelineDescription}>{item.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comentarios da Comunidade</Text>
          {commentsLoading ? (
            <View style={styles.commentsState}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.commentsStateText}>Carregando comentarios...</Text>
            </View>
          ) : null}

          {!commentsLoading && comments.length === 0 ? (
            <View style={styles.commentsState}>
              <Text style={styles.commentsStateText}>Nenhum comentario ainda.</Text>
            </View>
          ) : null}

          {comments.map((comment) => {
            const authorName = comment.author?.name || 'Morador';
            const initials = getInitials(authorName);
            const isEditing = editingCommentId === comment.id;
            const edited = wasCommentEdited(comment);

            return (
              <View key={comment.id} style={styles.commentCard}>
                {comment.author?.image ? (
                  <Image source={{ uri: comment.author.image }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarInitials}>
                    <Text style={styles.avatarInitialsText}>{initials}</Text>
                  </View>
                )}
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
              placeholder="Escreva um comentario..."
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
