import { View, Text, StyleSheet, Image } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import colors from '@/style/colors';

type ProfileInfoProps = {
    avatarUrl: string;
    name: string;
    location: string;
    memberSince: string;
};

export function ProfileInfo({ avatarUrl, name, location, memberSince }: ProfileInfoProps) {
    return (
        <View style={styles.profileInfoContainer}>
            <Image 
                source={{ uri: avatarUrl }} 
                style={styles.avatar} 
            />
            <Text style={styles.userName}>{name}</Text>
            <View style={styles.locationContainer}>
                <FontAwesome5 name="map-marker-alt" size={14} color={colors.darkGrey} />
                <Text style={styles.locationText}>{location}</Text>
            </View>
            <Text style={styles.memberSinceText}>{memberSince}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    profileInfoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: colors.white,
        marginBottom: 12,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.black,
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    locationText: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 6,
    },
    memberSinceText: {
        fontSize: 12,
        color: '#94a3b8',
    },
});
