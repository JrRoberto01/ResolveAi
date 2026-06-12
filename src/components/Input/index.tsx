import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { globalStyles } from '../../style/global';
import { colors } from '../../style/colors';
import { spacing } from '../../style/spacing';
import { styles } from './InputStyle';

interface InputProps extends TextInputProps {
  label?: string;
}

export function Input({ label, style, ...props }: InputProps) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          globalStyles.input,
          { marginBottom: 0 },
          props.multiline && { minHeight: 120, textAlignVertical: 'top' },
          style,
        ]}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
    </View>
  );
}
