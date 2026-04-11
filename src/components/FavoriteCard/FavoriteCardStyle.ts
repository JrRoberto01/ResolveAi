import { StyleSheet } from 'react-native';
import { colors } from '../../style/colors';
import { radii, spacing } from '../../style/spacing';

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'EM ANÁLISE': { bg: '#E6F0FA', text: '#0066CC' },
  PENDENTE: { bg: '#FFF3E0', text: '#E65100' },
  RESOLVIDO: { bg: '#E8F5E9', text: '#2E7D32' },
};

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginRight: spacing.md,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusIndicatorText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    backgroundColor: '#E1E1E1',
  },
});
