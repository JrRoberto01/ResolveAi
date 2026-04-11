import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { globalStyles } from '../../style/global';
import { getButtonVariantStyles } from './ButtonStyle';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  style?: any;
}

export function Button({ title, onPress, variant = 'primary', style }: ButtonProps) {
  const { buttonStyle, textStyle } = getButtonVariantStyles(variant, globalStyles.buttonPrimary, globalStyles.buttonPrimaryText, globalStyles.buttonOutline, globalStyles.buttonOutlineText);

  return (
    <TouchableOpacity style={[buttonStyle as StyleProp<ViewStyle>, style]} onPress={onPress} activeOpacity={0.8}>
      <Text style={textStyle as StyleProp<TextStyle>}>{title}</Text>
    </TouchableOpacity>
  );
}
