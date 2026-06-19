import { StyleSheet } from 'react-native';
import palette from './colors';

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
        color: palette.black,
    },
    sectionTitleOptions: {
        fontSize: 18,
        fontWeight: 'bold',
        color: palette.black,
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: 14,
        color: palette.darkBlue,
        fontWeight: '600',
    },
    optionsContainer: {
        backgroundColor: palette.white,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    loadingContainer: {
        minHeight: 220,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    avatarStatusText: {
        marginTop: -16,
        marginBottom: 16,
        textAlign: 'center' as const,
        color: '#64748b',
        fontSize: 12,
    },
    editProfileContainer: {
        marginBottom: 24,
    },
    editProfileTitle: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: palette.black,
        marginBottom: 12,
    },
    editProfileActions: {
        flexDirection: 'row' as const,
        gap: 12,
    },
    editProfileWarningText: {
        color: '#B45309',
        fontSize: 12,
        marginTop: -8,
        marginBottom: 12,
    },
    editProfileButton: {
        flex: 1,
    },
    emptyStateText: {
        color: '#64748b',
        fontSize: 14,
        textAlign: 'center' as const,
        paddingVertical: 16,
    },
    bottomSpacer: {
        height: 30,
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
        borderColor: palette.white,
    },
    avatarInitials: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: palette.white,
        backgroundColor: '#E0F2FE',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    avatarInitialsText: {
        color: '#0369A1',
        fontSize: 32,
        fontWeight: '700' as const,
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
        color: palette.black,
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

