import palette from '@/style/colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(28, 34, 55, 0.45)',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    card: {
        backgroundColor: palette.white,
        borderRadius: 28,
        padding: 24,
        gap: 16,
        shadowColor: '#14213D',
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 24,
        elevation: 12,
    },
    badge: {
        width: 56,
        height: 6,
        borderRadius: 999,
    },
    title: {
        color: palette.black,
        fontSize: 22,
        fontWeight: '700',
    },
    message: {
        color: '#5F6472',
        fontSize: 15,
        lineHeight: 22,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        minHeight: 48,
        borderRadius: 18,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    primaryButton: {
        backgroundColor: palette.darkBlue,
    },
    secondaryButton: {
        backgroundColor: palette.white,
    },
    primaryText: {
        color: palette.white,
        fontWeight: '700',
        fontSize: 15,
    },
    secondaryText: {
        color: palette.black,
        fontWeight: '700',
        fontSize: 15,
    },
});
