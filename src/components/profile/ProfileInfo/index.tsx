import { View, Text, Image, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Ionicons } from '@expo/vector-icons';
import palette from '@/style/colors';
import { styles } from './ProfileInfoStyle';

type ProfileInfoProps = {
    avatarUrl: string;
    name: string;
    location: string;
    memberSince: string;
    onAvatarPress?: () => void;
};

export function ProfileInfo({ avatarUrl, name, location, memberSince, onAvatarPress }: ProfileInfoProps) {
    return (
        <View style={styles.profileInfoContainer}>
            <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.7} style={styles.avatarWrapper}>
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                <View style={styles.cameraIconBadge}>
                    <Ionicons name="camera" size={14} color="#FFFFFF" />
                </View>
            </TouchableOpacity>
            <Text style={styles.userName}>{name}</Text>
            <View style={styles.locationContainer}>
                <FontAwesome5 name="map-marker-alt" size={14} color={palette.darkGrey} />
                <Text style={styles.locationText}>{location}</Text>
            </View>
            <Text style={styles.memberSinceText}>{memberSince}</Text>
        </View>
    );
}
