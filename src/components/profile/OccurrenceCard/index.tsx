import { View, Text, Image } from 'react-native';
import { styles } from './OccurrenceCardStyle';

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
            <Image source={{ uri: imageUrl }} style={styles.occurrenceImage} />
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
