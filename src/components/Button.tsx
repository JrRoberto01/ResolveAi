import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { globalStyles } from '../style/global';
import { colors } from '../style/colors';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  style?: any;
}

export function Button({ title, onPress, variant = 'primary', style }: ButtonProps) {
  let buttonStyle: StyleProp<ViewStyle> = globalStyles.buttonPrimary;
  let textStyle: StyleProp<TextStyle> = globalStyles.buttonPrimaryText;

  if (variant === 'outline') {
    buttonStyle = globalStyles.buttonOutline;
    textStyle = globalStyles.buttonOutlineText;
  } else if (variant === 'danger') {
    buttonStyle = [globalStyles.buttonOutline, { borderColor: colors.error }];
    textStyle = [globalStyles.buttonOutlineText, { color: colors.error }];
  }

  return (
    <TouchableOpacity style={[buttonStyle, style]} onPress={onPress} activeOpacity={0.8}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}
