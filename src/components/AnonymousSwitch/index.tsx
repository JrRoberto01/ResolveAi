import React from 'react';
import { View, Switch, Text } from 'react-native';
import { colors } from '../../style/colors';
import { styles } from './AnonymousSwitchStyle';

interface AnonymousSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  title?: string;
  subtitle?: string;
}

export function AnonymousSwitch({
  value,
  onValueChange,
  title = 'Postagem Anônima',
  subtitle = 'Sua identidade será preservada',
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
