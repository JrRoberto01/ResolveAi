import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { colors } from '../style/colors';
import { globalStyles } from '../style/global';
import { radii, spacing } from '../style/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface Ocorrencia {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | any;
  likes: number;
  comments: number;
  timeAgo: string;
  imageUrl?: any;
  photos?: string[];
  status?: string;
  anonymous?: boolean;
}

interface CardOcorrenciaProps {
  data: Ocorrencia;
  onPressSupport?: () => void;
  onPressEdit?: () => void;
  isSupported?: boolean;
}

export function CardOcorrencia({ data, onPressSupport, onPressEdit, isSupported = false }: CardOcorrenciaProps) {
  const defaultImage = require('../../assets/images/icon.png');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const allPhotos = data.photos && data.photos.length > 0 ? data.photos : [];
  const hasPhotos = allPhotos.length > 0;
  const photoCount = allPhotos.length;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const goToPhoto = (index: number) => {
    if (index < 0 || index >= photoCount) return;
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setActiveIndex(index);
  };

  const openGallery = (startIndex = 0) => {
    setActiveIndex(startIndex);
    setGalleryOpen(true);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: startIndex * SCREEN_WIDTH, animated: false });
    }, 50);
  };

  return (
    <View style={[globalStyles.card, { padding: 0, overflow: 'hidden' }]}>

      <TouchableOpacity
        style={styles.imageContainer}
        activeOpacity={hasPhotos ? 0.8 : 1}
        onPress={() => hasPhotos && openGallery(0)}
      >
        <Image
          source={hasPhotos ? { uri: allPhotos[0] } : (data.imageUrl || defaultImage)}
          style={styles.image}
          resizeMode="cover"
        />
        {data.status && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{data.status}</Text>
          </View>
        )}

        {onPressEdit && (
          <TouchableOpacity style={styles.editButton} onPress={onPressEdit}>
            <Ionicons name="pencil" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {hasPhotos && (
          <View style={styles.photoCountBadge}>
            <Ionicons name="images-outline" size={14} color="#FFFFFF" />
            <Text style={styles.photoCountText}>{photoCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {allPhotos.length > 1 && (
        <View style={styles.thumbnailStrip}>
          {allPhotos.slice(1, 5).map((uri, index) => (
            <TouchableOpacity
              key={index}
              style={styles.thumbWrapper}
              activeOpacity={0.8}
              onPress={() => openGallery(index + 1)}
            >
              <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{data.title}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="map-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.locationText}>
            {typeof data.location === 'string' ? data.location : (data.location?.address || 'Local marcado no mapa')}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {data.description}
        </Text>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionButton} onPress={onPressSupport}>
            <Ionicons name={isSupported ? "thumbs-up" : "thumbs-up-outline"} size={18} color={colors.primary} />
            <Text style={styles.actionTextPrimary}>{isSupported ? 'Apoiado (1)' : 'Apoiar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.actionText}>{data.comments}</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <Text style={styles.timeText}>{data.timeAgo}</Text>
        </View>
      </View>

      <Modal visible={galleryOpen} transparent animationType="fade">
        <View style={styles.viewerOverlay}>

          <View style={styles.viewerTopBar}>
            <Text style={styles.viewerCounter}>
              {activeIndex + 1} / {photoCount}
            </Text>
            <TouchableOpacity
              style={styles.viewerCloseButton}
              onPress={() => setGalleryOpen(false)}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>


          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            style={styles.viewerScroll}
            contentContainerStyle={styles.viewerScrollContent}
          >
            {allPhotos.map((uri, index) => (
              <View key={index} style={styles.viewerSlide}>
                <Image
                  source={{ uri }}
                  style={styles.viewerImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>


          {activeIndex > 0 && (
            <TouchableOpacity
              style={[styles.navArrow, styles.navArrowLeft]}
              onPress={() => goToPhoto(activeIndex - 1)}
            >
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {activeIndex < photoCount - 1 && (
            <TouchableOpacity
              style={[styles.navArrow, styles.navArrowRight]}
              onPress={() => goToPhoto(activeIndex + 1)}
            >
              <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          )}


          {photoCount > 1 && (
            <View style={styles.dotRow}>
              {allPhotos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === activeIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}


          <View style={styles.photoLabel}>
            <Text style={styles.photoLabelText}>
              {activeIndex === 0 ? 'Foto de Capa' : `Foto Complementar ${activeIndex}`}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    height: 150,
    width: '100%',
    backgroundColor: '#E1E1E1',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D97706',
    textTransform: 'uppercase',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },


  thumbnailStrip: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
  thumbWrapper: {
    flex: 1,
    height: 56,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#E1E1E1',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },


  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionTextPrimary: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 4,
  },
  actionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  editButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },


  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
  },
  viewerTopBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewerCounter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewerCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerScroll: {
    flex: 1,
  },
  viewerScrollContent: {
    alignItems: 'center',
  },
  viewerSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_HEIGHT * 0.65,
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  navArrowLeft: {
    left: 12,
  },
  navArrowRight: {
    right: 12,
  },
  dotRow: {
    position: 'absolute',
    bottom: 90,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  photoLabel: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  photoLabelText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
