import { StyleSheet } from 'react-native';
import { colors } from '../../style/colors';
import { spacing, radii } from '../../style/spacing';

export const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  textActive: {
    color: colors.surface,
    fontWeight: 'bold',
  },
});
