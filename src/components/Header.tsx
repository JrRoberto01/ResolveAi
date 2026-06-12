import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showNotification?: boolean;
}

export function Header({ title, showBack, onBack, showNotification }: HeaderProps) {
  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      
      <Text style={styles.title}>{title}</Text>
      
      {showNotification ? (
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: 50, 
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  iconButton: {
    padding: spacing.xs,
  },
  iconSpacer: {
    width: 32,
  }
});
