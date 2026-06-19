import { StyleSheet } from 'react-native';
import palette from '@/style/colors';

export const styles = StyleSheet.create({
    occurrenceCard: {
        flexDirection: 'row',
        backgroundColor: palette.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    occurrenceImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 12,
    },
    occurrenceInfo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    occurrenceTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: palette.black,
        marginBottom: 4,
    },
    occurrenceSubtitle: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 8,
    },
    statusPill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});
