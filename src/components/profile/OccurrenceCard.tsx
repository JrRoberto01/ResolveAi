import { View, Text, StyleSheet, Image } from 'react-native';
import colors from '@/style/colors';

type OccurrenceCardProps = {
    imageUrl: string;
    title: string;
    subtitle: string;
    status: 'Em análise' | 'Resolvido';
};

export function OccurrenceCard({ imageUrl, title, subtitle, status }: OccurrenceCardProps) {
    const isResolvido = status === 'Resolvido';
    const pillBg = isResolvido ? '#DCFCE7' : '#FEF9C3';
    const pillText = isResolvido ? '#15803D' : '#B45309';

    return (
        <View style={styles.occurrenceCard}>
            <Image 
                source={{ uri: imageUrl }} 
                style={styles.occurrenceImage} 
            />
            <View style={styles.occurrenceInfo}>
                <Text style={styles.occurrenceTitle}>{title}</Text>
                <Text style={styles.occurrenceSubtitle}>{subtitle}</Text>
                <View style={[styles.statusPill, { backgroundColor: pillBg }]}>
                    <Text style={[styles.statusText, { color: pillText }]}>{status}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    occurrenceCard: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: "#000",
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
        color: colors.black,
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
