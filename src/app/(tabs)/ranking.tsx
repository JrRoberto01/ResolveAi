import { globalStyles } from '@/style/global';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Ranking() {
    return (
        <SafeAreaView style={globalStyles.container}>
            <Text>Ranking</Text>
        </SafeAreaView>
    );
}
