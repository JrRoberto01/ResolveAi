import { StyleSheet } from 'react-native';
import colors from './colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: 16,
    },
    sectionContainer: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.black,
    },
    sectionTitleOptions: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.black,
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: 14,
        color: colors.darkBlue,
        fontWeight: '600',
    },
    optionsContainer: {
        backgroundColor: colors.white,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },

    // ProfileInfo
    profileInfoContainer: {
        alignItems: 'center' as const,
        marginBottom: 24,
    },
    avatarWrapper: {
        position: 'relative' as const,
        marginBottom: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: colors.white,
    },
    cameraIconBadge: {
        position: 'absolute' as const,
        bottom: 2,
        right: 2,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#0066CC',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold' as const,
        color: colors.black,
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
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
