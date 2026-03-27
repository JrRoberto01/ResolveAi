import { View, Text, StyleSheet } from 'react-native';
import colors from '@/style/colors';

type StatCardProps = {
    number: string | number;
    label: string;
};

export function StatCard({ number, label }: StatCardProps) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statNumber}>{number}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    statCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.darkBlue,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748b',
        letterSpacing: 1,
    },
});
