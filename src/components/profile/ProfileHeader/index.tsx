import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import palette from '@/style/colors';
import { styles } from './ProfileHeaderStyle';

export function ProfileHeader() {
    return (
        <View style={styles.header}>
            <TouchableOpacity>
                <FontAwesome5 name="cog" size={24} color={palette.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Meu Perfil</Text>
            <TouchableOpacity>
                <FontAwesome5 name="share-alt" size={24} color={palette.black} />
            </TouchableOpacity>
        </View>
    );
}
