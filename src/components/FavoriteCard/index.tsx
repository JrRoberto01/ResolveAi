import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../style/colors';
import { globalStyles } from '../../style/global';
import { Ocorrencia } from '../CardOcorrencia';
import { STATUS_COLORS, styles } from './FavoriteCardStyle';

interface FavoriteCardProps {
  data: Ocorrencia;
  onPressDetails?: () => void;
}

export function FavoriteCard({ data, onPressDetails }: FavoriteCardProps) {
  const defaultImage = require('../../../assets/images/icon.png');
  const hasPhotos = data.photos && data.photos.length > 0;
  const statusStyle = STATUS_COLORS[data.status?.toUpperCase() || ''] || STATUS_COLORS['EM ANÁLISE'];

  return (
    <View style={[globalStyles.card, styles.card]}>
      <View style={styles.content}>
        {data.status ? (
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
            <Text style={[styles.statusIndicatorText, { color: statusStyle.text }]}>NOVO STATUS</Text>
          </View>
        ) : null}

        <Text style={styles.title} numberOfLines={2}>
          {data.title}
        </Text>

        <Text style={styles.subtitle} numberOfLines={1}>
          {data.timeAgo}
          {typeof data.location === 'string' && data.location ? ` • ${data.location}` : ''}
          {typeof data.location === 'object' && data.location?.address ? ` • ${data.location.address}` : ''}
        </Text>

        <View style={styles.footer}>
          {data.status ? (
            <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusPillText, { color: statusStyle.text }]}>{data.status}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.detailsButton} onPress={onPressDetails}>
            <Text style={styles.detailsText}>Ver Detalhes</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <Image
        source={hasPhotos ? { uri: data.photos![0] } : data.imageUrl || defaultImage}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

