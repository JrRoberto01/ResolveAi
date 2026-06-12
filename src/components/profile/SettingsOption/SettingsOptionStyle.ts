import { StyleSheet } from 'react-native';
import palette from '@/style/colors';

export const styles = StyleSheet.create({
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIcon: {
        width: 24,
        textAlign: 'center',
        marginRight: 12,
        color: '#475569',
    },
    optionText: {
        fontSize: 16,
        color: palette.black,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginLeft: 52,
    },
});
