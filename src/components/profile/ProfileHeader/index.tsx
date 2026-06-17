import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import palette from '@/style/colors';
import { styles } from './ProfileHeaderStyle';

type ProfileHeaderProps = {
    title?: string;
    showBack?: boolean;
    showShare?: boolean;
    onBack?: () => void;
};

export function ProfileHeader({ title = 'Meu Perfil', showBack = false, showShare = true, onBack }: ProfileHeaderProps) {
    return (
        <View style={styles.header}>
            {showBack ? (
                <TouchableOpacity onPress={onBack} style={styles.headerSide}>
                    <FontAwesome5 name="chevron-left" size={22} color={palette.black} />
                </TouchableOpacity>
            ) : (
                <View style={styles.headerSide} />
            )}
            <Text style={styles.headerTitle}>{title}</Text>
            {showShare ? (
                <TouchableOpacity style={styles.headerSide}>
                    <FontAwesome5 name="share-alt" size={24} color={palette.black} />
                </TouchableOpacity>
            ) : (
                <View style={styles.headerSide} />
            )}
        </View>
    );
}
