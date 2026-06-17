import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './OccurrenceCardStyle';

type OccurrenceCardProps = {
    imageUrl?: string | null;
    title: string;
    subtitle: string;
    status: 'Em análise' | 'Resolvido' | 'Rejeitado';
    onPress?: () => void;
};

export function OccurrenceCard({ imageUrl, title, subtitle, status, onPress }: OccurrenceCardProps) {
    const isResolvido = status === 'Resolvido';
    const isRejeitado = status === 'Rejeitado';
    const pillBg = isResolvido ? '#DCFCE7' : isRejeitado ? '#FEE2E2' : '#FEF9C3';
    const pillText = isResolvido ? '#15803D' : isRejeitado ? '#B91C1C' : '#B45309';

    return (
        <TouchableOpacity
            style={styles.occurrenceCard}
            onPress={onPress}
            activeOpacity={onPress ? 0.82 : 1}
            disabled={!onPress}
        >
            {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.occurrenceImage} /> : null}
            <View style={styles.occurrenceInfo}>
                <Text style={styles.occurrenceTitle}>{title}</Text>
                <Text style={styles.occurrenceSubtitle}>{subtitle}</Text>
                <View style={[styles.statusPill, { backgroundColor: pillBg }]}>
                    <Text style={[styles.statusText, { color: pillText }]}>{status}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
