import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../style/colors';
import { globalStyles } from '../../style/global';
import { styles, SCREEN_WIDTH } from './CardOcorrenciaStyle';

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
  const defaultImage = require('../../../assets/images/icon.png');
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
          source={hasPhotos ? { uri: allPhotos[0] } : data.imageUrl || defaultImage}
          style={styles.image}
          resizeMode="cover"
        />
        {data.status ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{data.status}</Text>
          </View>
        ) : null}

        {onPressEdit ? (
          <TouchableOpacity style={styles.editButton} onPress={onPressEdit}>
            <Ionicons name="pencil" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}

        {hasPhotos ? (
          <View style={styles.photoCountBadge}>
            <Ionicons name="images-outline" size={14} color="#FFFFFF" />
            <Text style={styles.photoCountText}>{photoCount}</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      {allPhotos.length > 1 ? (
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
      ) : null}

      <View style={styles.content}>
        <Text style={styles.title}>{data.title}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="map-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.locationText}>
            {typeof data.location === 'string' ? data.location : data.location?.address || 'Local marcado no mapa'}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {data.description}
        </Text>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionButton} onPress={onPressSupport}>
            <Ionicons name={isSupported ? 'thumbs-up' : 'thumbs-up-outline'} size={18} color={colors.primary} />
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
            <TouchableOpacity style={styles.viewerCloseButton} onPress={() => setGalleryOpen(false)}>
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
                <Image source={{ uri }} style={styles.viewerImage} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>

          {activeIndex > 0 ? (
            <TouchableOpacity style={[styles.navArrow, styles.navArrowLeft]} onPress={() => goToPhoto(activeIndex - 1)}>
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}

          {activeIndex < photoCount - 1 ? (
            <TouchableOpacity style={[styles.navArrow, styles.navArrowRight]} onPress={() => goToPhoto(activeIndex + 1)}>
              <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}

          {photoCount > 1 ? (
            <View style={styles.dotRow}>
              {allPhotos.map((_, index) => (
                <View key={index} style={[styles.dot, index === activeIndex && styles.dotActive]} />
              ))}
            </View>
          ) : null}

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

