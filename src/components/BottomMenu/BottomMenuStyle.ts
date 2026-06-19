import { Platform, StyleSheet } from 'react-native';
import { colors } from '../../style/colors';
import { spacing } from '../../style/spacing';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  text: {
    fontSize: 10,
    marginTop: 4,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  textActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
