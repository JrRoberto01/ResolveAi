import React from 'react';
import { View, Switch, Text, StyleSheet } from "react-native";
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface AnonymousSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  title?: string;
  subtitle?: string;
}

export function AnonymousSwitch({ 
  value, 
  onValueChange, 
  title = "Postagem Anônima", 
  subtitle = "Sua identidade será preservada" 
}: AnonymousSwitchProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ false: '#767577', true: colors.primary }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  title: {
    fontWeight: 'bold',
    color: colors.text,
    fontSize: 14,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  }
});
