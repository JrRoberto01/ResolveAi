import { colors } from '../../style/colors';

export function getButtonVariantStyles(
  variant: 'primary' | 'outline' | 'danger',
  buttonPrimary: any,
  buttonPrimaryText: any,
  buttonOutline: any,
  buttonOutlineText: any,
) {
  if (variant === 'outline') {
    return {
      buttonStyle: buttonOutline,
      textStyle: buttonOutlineText,
    };
  }

  if (variant === 'danger') {
    return {
      buttonStyle: [buttonOutline, { borderColor: colors.error }],
      textStyle: [buttonOutlineText, { color: colors.error }],
    };
  }

  return {
    buttonStyle: buttonPrimary,
    textStyle: buttonPrimaryText,
  };
}
