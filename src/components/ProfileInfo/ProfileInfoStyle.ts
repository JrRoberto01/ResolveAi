import palette from '@/style/colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    profileInfoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: palette.white,
    },
    avatarInitials: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: palette.white,
        backgroundColor: '#E0F2FE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitialsText: {
        color: '#0369A1',
        fontSize: 32,
        fontWeight: '700',
    },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: palette.darkBlue,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: palette.white,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: palette.black,
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    locationText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#64748b',
    },
    memberSinceText: {
        fontSize: 12,
        color: '#94a3b8',
    },
});
