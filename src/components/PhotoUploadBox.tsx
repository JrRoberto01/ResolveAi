import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../style/colors';
import { spacing } from '../style/spacing';

interface PhotoUploadBoxProps {
  onPress?: () => void;
  label?: string;
  photos?: string[];
}

export function PhotoUploadBox({ onPress, label, photos = [] }: PhotoUploadBoxProps) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailRow}>
          {photos.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.thumbnail} />
          ))}
        </ScrollView>
      )}

      {photos.length < 5 && (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
          <View style={styles.iconCircle}>
            <Ionicons name="camera" size={24} color={colors.primary} />
          </View>
          <Text style={styles.mainText}>Tirar foto ou anexar</Text>
          <Text style={styles.subText}>
            {photos.length > 0
              ? `${photos.length}/5 fotos adicionadas`
              : 'Máximo 5 fotos (JPG, PNG)'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  container: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  mainText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  thumbnailRow: {
    marginBottom: spacing.sm,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
});
