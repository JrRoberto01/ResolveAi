import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import colors from '@/style/colors';

export function ProfileHeader() {
    return (
        <View style={styles.header}>
            <TouchableOpacity>
                <FontAwesome5 name="cog" size={24} color={colors.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Meu Perfil</Text>
            <TouchableOpacity>
                <FontAwesome5 name="share-alt" size={24} color={colors.black} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.black,
    },
});
