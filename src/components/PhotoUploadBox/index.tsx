import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../style/colors';
import { styles } from './PhotoUploadBoxStyle';

interface PhotoUploadBoxProps {
  onPress?: () => void;
  label?: string;
  photos?: string[];
}

export function PhotoUploadBox({ onPress, label, photos = [] }: PhotoUploadBoxProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {photos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailRow}>
          {photos.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.thumbnail} />
          ))}
        </ScrollView>
      ) : null}

      {photos.length < 5 ? (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
          <View style={styles.iconCircle}>
            <Ionicons name="camera" size={24} color={colors.primary} />
          </View>
          <Text style={styles.mainText}>Tirar foto ou anexar</Text>
          <Text style={styles.subText}>
            {photos.length > 0 ? `${photos.length}/5 fotos adicionadas` : 'Máximo 5 fotos (JPG, PNG)'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
