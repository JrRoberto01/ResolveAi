import { StyleSheet } from 'react-native';
import { colors } from '../../style/colors';
import { spacing } from '../../style/spacing';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    height: 40,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
});
