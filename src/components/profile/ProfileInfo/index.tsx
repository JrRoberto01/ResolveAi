import { View, Text, Image, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Ionicons } from '@expo/vector-icons';
import palette from '@/style/colors';
import { styles } from '@/style/profile_style';

type ProfileInfoProps = {
    avatarUrl?: string | null;
    name: string;
    location?: string;
    memberSince?: string;
    onAvatarPress?: () => void;
};

export function ProfileInfo({ avatarUrl, name, location, memberSince, onAvatarPress }: ProfileInfoProps) {
    const initials = name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || 'U';

    return (
        <View style={styles.profileInfoContainer}>
            <TouchableOpacity
                onPress={onAvatarPress}
                activeOpacity={onAvatarPress ? 0.7 : 1}
                disabled={!onAvatarPress}
                style={styles.avatarWrapper}
            >
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarInitials}>
                        <Text style={styles.avatarInitialsText}>{initials}</Text>
                    </View>
                )}
                {onAvatarPress ? (
                    <View style={styles.cameraIconBadge}>
                        <Ionicons name="camera" size={14} color="#FFFFFF" />
                    </View>
                ) : null}
            </TouchableOpacity>
            <Text style={styles.userName}>{name}</Text>
            {location ? (
                <View style={styles.locationContainer}>
                    <FontAwesome5 name="map-marker-alt" size={14} color={palette.darkGrey} />
                    <Text style={styles.locationText}>{location}</Text>
                </View>
            ) : null}
            {memberSince ? <Text style={styles.memberSinceText}>{memberSince}</Text> : null}
        </View>
    );
}
