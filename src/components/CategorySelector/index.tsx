import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { CategoryPill } from '../CategoryPill';
import { spacing } from '../../style/spacing';
import { styles } from './CategorySelectorStyle';

interface CategorySelectorProps {
  categories: string[];
  activeCategory: string;
  onSelect: (cat: string) => void;
  label?: string;
  horizontal?: boolean;
}

export function CategorySelector({ categories, activeCategory, onSelect, label, horizontal = false }: CategorySelectorProps) {
  const content = categories.map((cat) => (
    <CategoryPill
      key={cat}
      label={cat}
      isActive={activeCategory === cat}
      onPress={() => onSelect(cat)}
    />
  ));

  return (
    <View style={[styles.container, horizontal && { marginBottom: spacing.sm }]}> 
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {horizontal ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {content}
        </ScrollView>
      ) : (
        <View style={styles.wrapContainer}>{content}</View>
      )}
    </View>
  );
}
