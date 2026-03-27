import { OccurrenceCard } from '@/components/profile/OccurrenceCard';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { SettingsOption } from '@/components/profile/SettingsOption';
import { StatCard } from '@/components/profile/StatCard';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../../style/profile_style';
import { occurrences, settingsOptions, userData } from './profile.data';

export default function Profile() {
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

                {/* Minhas Ocorrências */}
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

                {/* Configurações */}
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
                            />
                        ))}
                    </View>
                </View>

                {/* Spacer bottom*/}
                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}