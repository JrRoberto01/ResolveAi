import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { CategoryPill } from './CategoryPill';
import { spacing } from '../style/spacing';
import { colors } from '../style/colors';

interface CategorySelectorProps {
  categories: string[];
  activeCategory: string;
  onSelect: (cat: string) => void;
  label?: string;
  horizontal?: boolean;
}

export function CategorySelector({ categories, activeCategory, onSelect, label, horizontal = false }: CategorySelectorProps) {
  const content = categories.map(cat => (
    <CategoryPill 
      key={cat}
      label={cat}
      isActive={activeCategory === cat}
      onPress={() => onSelect(cat)}
    />
  ));

  return (
    <View style={[styles.container, horizontal && { marginBottom: spacing.sm }]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      {horizontal ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {content}
        </ScrollView>
      ) : (
        <View style={styles.wrapContainer}>
          {content}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  wrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  }
});
