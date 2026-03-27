import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../style/global';
import { colors } from '../style/colors';
import { spacing, radii } from '../style/spacing';

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
  status?: string;
  anonymous?: boolean;
}

interface CardOcorrenciaProps {
  data: Ocorrencia;
  onPressSupport?: () => void;
  onPressEdit?: () => void;
}

export function CardOcorrencia({ data, onPressSupport, onPressEdit }: CardOcorrenciaProps) {
  const defaultImage = require('../../assets/images/icon.png');

  return (
    <View style={[globalStyles.card, { padding: 0, overflow: 'hidden' }]}>
      <View style={styles.imageContainer}>
        <Image 
          source={data.imageUrl ? data.imageUrl : defaultImage} 
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
      </View>

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
            <Ionicons name="thumbs-up-outline" size={18} color={colors.primary} />
            <Text style={styles.actionTextPrimary}>Apoiar ({data.likes})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.actionText}>{data.comments}</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />
          
          <Text style={styles.timeText}>{data.timeAgo}</Text>
        </View>
      </View>
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
  }
});
