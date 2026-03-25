import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';

export interface CategoryPillProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export function CategoryPill({ label, isActive, onPress }: CategoryPillProps) {
  return (
    <TouchableOpacity 
      style={[styles.pill, isActive && styles.pillActive]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, isActive && styles.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  textActive: {
    color: colors.surface,
    fontWeight: 'bold',
  }
});
