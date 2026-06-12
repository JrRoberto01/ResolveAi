import { View, Text } from 'react-native';
import { styles } from './StatCardStyle';

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
