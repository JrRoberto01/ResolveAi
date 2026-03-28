import { OccurrenceCard } from '@/components/profile/OccurrenceCard';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { SettingsOption } from '@/components/profile/SettingsOption';
import { StatCard } from '@/components/profile/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../../style/profile_style';
import { occurrences, userData } from './profile.data';

export default function Profile() {
    // const { user, loading, refreshing, error} = getUserData();
    const { signOut } = useAuth();

    // if (loading) {
    //     return <ActivityIndicator style={{ flex: 1 }} size="large" />;
    // }

    // if (error) {
    //     return <Text>Erro: {error}</Text>;
    // }

    async function handleSignOut() {
        await signOut();
        router.replace("/(auth)/sign-in");
    }

    const settingsOptions = [
        {
            icon: 'user',
            text: 'Editar Perfil',
            showDivider: true,
        },
        {
            icon: 'bell',
            text: 'Notificações',
            showDivider: true,
        },
        {
            icon: 'lock',
            text: 'Privacidade',
            showDivider: true,
        },
        {
            icon: 'sign-out-alt',
            text: 'Sair',
            isDanger: true,
            onPress: handleSignOut,
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <ProfileHeader />

                <ProfileInfo
                    avatarUrl={userData.avatarUrl}
                    name={userData.name}
                    location={userData.location}
                    memberSince={userData.memberSince}
                />

                <View style={styles.statsContainer}>
                    <StatCard number={userData.stats.occurrences} label="OCORRÊNCIAS" />
                    <StatCard number={userData.stats.supports} label="APOIOS" />
                </View>

                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Minhas Ocorrências</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Ver todas</Text>
                        </TouchableOpacity>
                    </View>

                    {occurrences.map((occurrence) => (
                        <OccurrenceCard
                            key={occurrence.id}
                            imageUrl={occurrence.imageUrl}
                            title={occurrence.title}
                            subtitle={occurrence.subtitle}
                            status={occurrence.status}
                        />
                    ))}
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitleOptions}>Configurações</Text>

                    <View style={styles.optionsContainer}>
                        {settingsOptions.map((option, index) => (
                            <SettingsOption
                                key={index}
                                icon={option.icon}
                                text={option.text}
                                showDivider={option.showDivider}
                                isDanger={option.isDanger}
                                onPress={option.onPress}
                            />
                        ))}
                    </View>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
