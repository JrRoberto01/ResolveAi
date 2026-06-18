import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../style/colors';
import { styles } from './BottomMenuStyle';

export function BottomMenu() {
  const tabs = [
    { name: 'Feed', icon: 'list', active: true },
    { name: 'Ranking', icon: 'trophy-outline', active: false },
    { name: 'Favoritos', icon: 'heart-outline', active: false },
    { name: 'Perfil', icon: 'person-outline', active: false },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab.name} style={styles.tab}>
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
