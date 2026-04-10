import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../style/colors';
import { globalStyles } from '../style/global';
import { radii, spacing } from '../style/spacing';
import { Ocorrencia } from './CardOcorrencia';

interface FavoriteCardProps {
  data: Ocorrencia;
  onPressDetails?: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'EM ANÁLISE': { bg: '#E6F0FA', text: '#0066CC' },
  'PENDENTE': { bg: '#FFF3E0', text: '#E65100' },
  'RESOLVIDO': { bg: '#E8F5E9', text: '#2E7D32' },
};

export function FavoriteCard({ data, onPressDetails }: FavoriteCardProps) {
  const defaultImage = require('../../assets/images/icon.png');
  const hasPhotos = data.photos && data.photos.length > 0;

  const statusStyle = STATUS_COLORS[data.status?.toUpperCase() || ''] || STATUS_COLORS['EM ANÁLISE'];

  return (
    <View style={[globalStyles.card, styles.card]}>
      <View style={styles.content}>
        {data.status && (
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
            <Text style={[styles.statusIndicatorText, { color: statusStyle.text }]}>
              NOVO STATUS
            </Text>
          </View>
        )}

        <Text style={styles.title} numberOfLines={2}>
          {data.title}
        </Text>

        <Text style={styles.subtitle} numberOfLines={1}>
          {data.timeAgo}
          {typeof data.location === 'string' && data.location ? ` • ${data.location}` : ''}
          {typeof data.location === 'object' && data.location?.address ? ` • ${data.location.address}` : ''}
        </Text>

        <View style={styles.footer}>
          {data.status && (
            <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
                {data.status}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.detailsButton} onPress={onPressDetails}>
            <Text style={styles.detailsText}>Ver Detalhes</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <Image
        source={hasPhotos ? { uri: data.photos![0] } : (data.imageUrl || defaultImage)}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginRight: spacing.md,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusIndicatorText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    backgroundColor: '#E1E1E1',
  },
});
