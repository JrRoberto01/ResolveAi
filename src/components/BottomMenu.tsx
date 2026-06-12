import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function BottomMenu() {
  const tabs = [
    { name: 'Feed', icon: 'list', active: true },
    { name: 'Ranking', icon: 'trophy-outline', active: false },
    { name: 'Favoritos', icon: 'heart-outline', active: false },
    { name: 'Perfil', icon: 'person-outline', active: false },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity key={index} style={styles.tab}>
          <Ionicons 
            name={tab.icon as any} 
            size={24} 
            color={tab.active ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.text, tab.active && styles.textActive]}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  text: {
    fontSize: 10,
    marginTop: 4,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  textActive: {
    color: colors.primary,
    fontWeight: 'bold',
  }
});
