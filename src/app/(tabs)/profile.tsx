import { File } from 'expo-file-system';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { toggleOccurrenceSupport } from '@/api/occurrences.api';
import {
    getProfile,
    ProfileSummary,
    updateProfileImage,
    updateProfileName,
    updateProfilePassword,
} from '@/api/profile.api';
import { Button } from '@/components/Button';
import { Camera } from '@/components/Camera';
import type { Ocorrencia } from '@/components/CardOcorrencia';
import { Input } from '@/components/Input';
import { OccurrenceDetails } from '@/components/OccurrenceDetails';
import { OccurrenceCard } from '@/components/OccurrenceCard';
import { ProfileHeader } from '@/components/ProfileHeader';
import { ProfileInfo } from '@/components/ProfileInfo';
import { SettingsOption } from '@/components/SettingsOption';
import { StatCard } from '@/components/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { styles } from '../../style/profile_style';

const statusLabels: Record<ProfileSummary['occurrences'][number]['status'], 'Em análise' | 'Resolvido' | 'Rejeitado'> = {
    IN_ANALYSIS: 'Em análise',
    RESOLVED: 'Resolvido',
    REJECTED: 'Rejeitado',
};

const detailStatusLabels: Record<ProfileSummary['occurrences'][number]['status'], string> = {
    IN_ANALYSIS: 'EM ANÁLISE',
    RESOLVED: 'RESOLVIDO',
    REJECTED: 'REJEITADO',
};

function formatTimeAgo(date: string) {
    const createdAt = new Date(date).getTime();
    const diffInMinutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60000));

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
}

function formatMemberSince(date?: string | null) {
    if (!date) {
        return undefined;
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return undefined;
    }

    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
    }).format(parsedDate);

    return `Membro desde ${formattedDate}`;
}

function formatLocation(city?: string | null, state?: string | null) {
    return [city, state].filter(Boolean).join(', ') || undefined;
}

async function photoToApiUri(uri: string) {
    if (uri.startsWith('data:') || uri.startsWith('http://') || uri.startsWith('https://')) {
        return uri;
    }

    const base64 = await new File(uri).base64();
    return `data:image/jpeg;base64,${base64}`;
}

function occurrenceToDetails(occurrence: ProfileSummary['occurrences'][number]): Ocorrencia {
    const hasLocation = occurrence.latitude !== null && occurrence.longitude !== null;
    const location = hasLocation
        ? {
            latitude: occurrence.latitude,
            longitude: occurrence.longitude,
            address: occurrence.address ?? undefined,
        }
        : occurrence.address ?? 'Local marcado no mapa';

    return {
        id: String(occurrence.id),
        title: occurrence.title,
        description: occurrence.description ?? '',
        category: occurrence.category,
        anonymous: occurrence.anonymous,
        location,
        likes: occurrence.supportCount,
        comments: occurrence.commentsCount,
        timeAgo: formatTimeAgo(occurrence.createdAt),
        status: detailStatusLabels[occurrence.status],
        photos: occurrence.photos,
        imageUrl: occurrence.photos.length > 0 ? { uri: occurrence.photos[0] } : undefined,
        supportedByMe: occurrence.supportedByMe,
        canEdit: occurrence.canEdit,
    };
}

export default function Profile() {
    const { signOut } = useAuth();
    const [profile, setProfile] = useState<ProfileSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingAvatar, setSavingAvatar] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);
    const [editingPassword, setEditingPassword] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [currentPasswordInput, setCurrentPasswordInput] = useState('');
    const [newPasswordInput, setNewPasswordInput] = useState('');
    const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
    const [nameSaveError, setNameSaveError] = useState<string | null>(null);
    const [passwordSaveError, setPasswordSaveError] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [showAllOccurrences, setShowAllOccurrences] = useState(false);
    const [selectedOccurrence, setSelectedOccurrence] = useState<Ocorrencia | null>(null);

    const loadProfile = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            setProfile(await getProfile());
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Erro ao carregar perfil',
                text2: err?.friendlyMessage || err?.message,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            void loadProfile(false);

            const refreshInterval = setInterval(() => {
                void loadProfile(false);
            }, 15000);

            return () => {
                clearInterval(refreshInterval);
            };
        }, [loadProfile]),
    );

    async function handleSignOut() {
        await signOut({ clearBiometric: true });
        router.replace('/(auth)/sign-in');
    }

    function handleAvatarPress() {
        setShowCamera(true);
    }

    async function handleCapture(uri: string) {
        try {
            setShowCamera(false);
            setSavingAvatar(true);

            const updatedUser = await updateProfileImage(await photoToApiUri(uri));

            setProfile((currentProfile) => currentProfile
                ? { ...currentProfile, user: { ...currentProfile.user, ...updatedUser } }
                : currentProfile);

            Toast.show({ type: 'success', text1: 'Foto atualizada' });
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Não foi possível salvar a foto',
                text2: err?.friendlyMessage || err?.message,
            });
        } finally {
            setSavingAvatar(false);
        }
    }

    function handleCloseCamera() {
        setShowCamera(false);
    }

    function handleEditProfile() {
        setNameInput(profile?.user.name ?? '');
        setNameSaveError(null);
        setEditingPassword(false);
        setEditingProfile(true);
    }

    function handleCancelEditProfile() {
        setNameInput(profile?.user.name ?? '');
        setNameSaveError(null);
        setEditingProfile(false);
    }

    function clearPasswordForm() {
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
        setPasswordSaveError(null);
    }

    function handleEditPassword() {
        clearPasswordForm();
        setEditingProfile(false);
        setEditingPassword(true);
    }

    function handleCancelEditPassword() {
        clearPasswordForm();
        setEditingPassword(false);
    }

    async function handleSaveProfile() {
        const nextName = nameInput.trim();
        const previousName = profile?.user.name;

        if (!nextName) {
            Toast.show({ type: 'error', text1: 'Informe seu nome' });
            return;
        }

        if (savingProfile) {
            return;
        }

        if (nextName === previousName) {
            setEditingProfile(false);
            return;
        }

        try {
            setSavingProfile(true);
            setNameSaveError(null);
            setEditingProfile(false);
            setProfile((currentProfile) => currentProfile
                ? { ...currentProfile, user: { ...currentProfile.user, name: nextName } }
                : currentProfile);

            const updatedUser = await updateProfileName(nextName);

            setProfile((currentProfile) => currentProfile
                ? { ...currentProfile, user: { ...currentProfile.user, ...updatedUser, name: nextName } }
                : currentProfile);
            Toast.show({ type: 'success', text1: 'Perfil atualizado' });
        } catch (err: any) {
            if (previousName) {
                setProfile((currentProfile) => currentProfile
                    ? { ...currentProfile, user: { ...currentProfile.user, name: previousName } }
                    : currentProfile);
                setNameInput(previousName);
            }

            setEditingProfile(true);
            setNameSaveError(err?.friendlyMessage || err?.message || 'Não foi possível salvar o nome.');
            Toast.show({
                type: 'error',
                text1: 'Não foi possível salvar o perfil',
                text2: err?.friendlyMessage || err?.message,
            });
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleSavePassword() {
        const currentPassword = currentPasswordInput.trim();
        const nextPassword = newPasswordInput.trim();
        const confirmPassword = confirmPasswordInput.trim();

        if (!currentPassword || !nextPassword || !confirmPassword) {
            setPasswordSaveError('Preencha a senha atual, a nova senha e a confirmação.');
            return;
        }

        if (nextPassword.length < 6) {
            setPasswordSaveError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (nextPassword !== confirmPassword) {
            setPasswordSaveError('A confirmação precisa ser igual à nova senha.');
            return;
        }

        if (savingPassword) {
            return;
        }

        try {
            setSavingPassword(true);
            setPasswordSaveError(null);

            await updateProfilePassword(currentPassword, nextPassword);

            clearPasswordForm();
            setEditingPassword(false);
            Toast.show({ type: 'success', text1: 'Senha atualizada' });
        } catch (err: any) {
            setPasswordSaveError(err?.friendlyMessage || err?.message || 'Não foi possível alterar a senha.');
            Toast.show({
                type: 'error',
                text1: 'Não foi possível alterar a senha',
                text2: err?.friendlyMessage || err?.message,
            });
        } finally {
            setSavingPassword(false);
        }
    }

    async function handleToggleSelectedSupport() {
        if (!selectedOccurrence) {
            return;
        }

        try {
            const wasSupported = selectedOccurrence.supportedByMe;
            const result = await toggleOccurrenceSupport(Number(selectedOccurrence.id));
            const updatedOccurrence = result.occurrence;
            const updatedDetails = occurrenceToDetails(updatedOccurrence);
            const supportDelta = result.supported === wasSupported ? 0 : result.supported ? 1 : -1;

            setSelectedOccurrence(updatedDetails);
            setProfile((currentProfile) => currentProfile
                ? {
                    ...currentProfile,
                    stats: {
                        ...currentProfile.stats,
                        supports: Math.max(0, currentProfile.stats.supports + supportDelta),
                    },
                    occurrences: currentProfile.occurrences.map((occurrence) =>
                        occurrence.id === updatedOccurrence.id ? updatedOccurrence : occurrence,
                    ),
                }
                : currentProfile);
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Não foi possível apoiar',
                text2: err?.friendlyMessage || err?.message,
            });
        }
    }

    const handleCommentCountChange = useCallback((occurrenceId: string, count: number) => {
        setSelectedOccurrence((currentOccurrence) =>
            currentOccurrence?.id === occurrenceId && currentOccurrence.comments !== count
                ? { ...currentOccurrence, comments: count }
                : currentOccurrence,
        );
        setProfile((currentProfile) => currentProfile
            ? {
                ...currentProfile,
                occurrences: currentProfile.occurrences.map((occurrence) =>
                    String(occurrence.id) === occurrenceId && occurrence.commentsCount !== count
                        ? { ...occurrence, commentsCount: count }
                        : occurrence,
                ),
            }
            : currentProfile);
    }, []);

    const handleOccurrenceChange = useCallback((updatedOccurrence: Ocorrencia) => {
        setSelectedOccurrence((currentOccurrence) =>
            currentOccurrence?.id === updatedOccurrence.id ? updatedOccurrence : currentOccurrence,
        );
        void loadProfile(false);
    }, [loadProfile]);

    const settingsOptions = [
        {
            icon: 'user',
            text: 'Editar Perfil',
            showDivider: true,
            onPress: handleEditProfile,
        },
        {
            icon: 'bell',
            text: 'Notificações',
            showDivider: true,
            onPress: () => router.push('/(tabs)/notifications'),
        },
        {
            icon: 'lock',
            text: 'Privacidade',
            showDivider: true,
            onPress: handleEditPassword,
        },
        {
            icon: 'sign-out-alt',
            text: 'Sair',
            isDanger: true,
            onPress: handleSignOut,
        },
    ];

    const user = profile?.user;
    const location = formatLocation(user?.city, user?.state);
    const memberSince = formatMemberSince(user?.createdAt);
    const sortedOccurrences = [...(profile?.occurrences ?? [])].sort(
        (firstOccurrence, secondOccurrence) =>
            new Date(secondOccurrence.createdAt).getTime() - new Date(firstOccurrence.createdAt).getTime(),
    );
    const visibleOccurrences = showAllOccurrences ? sortedOccurrences : sortedOccurrences.slice(0, 2);
    const hasMoreOccurrences = sortedOccurrences.length > 2;

    if (selectedOccurrence) {
        return (
            <SafeAreaView style={styles.container}>
                <OccurrenceDetails
                    occurrence={selectedOccurrence}
                    isSupported={selectedOccurrence.supportedByMe}
                    onBack={() => setSelectedOccurrence(null)}
                    onPressSupport={() => {
                        void handleToggleSelectedSupport();
                    }}
                    onCommentCountChange={handleCommentCountChange}
                    onOccurrenceChange={handleOccurrenceChange}
                />
                <Toast position="top" bottomOffset={20} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Modal visible={showCamera} animationType="slide">
                <Camera onCapture={handleCapture} onClose={handleCloseCamera} />
            </Modal>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <ProfileHeader />

                {loading && !profile ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator />
                    </View>
                ) : (
                    <>
                        <ProfileInfo
                            avatarUrl={user?.image}
                            name={user?.name ?? 'Usuário'}
                            location={location}
                            memberSince={memberSince}
                            onAvatarPress={handleAvatarPress}
                        />

                        {savingAvatar ? <Text style={styles.avatarStatusText}>Salvando foto...</Text> : null}

                        {editingProfile ? (
                            <View style={styles.editProfileContainer}>
                                <Input
                                    label="Nome"
                                    value={nameInput}
                                    onChangeText={(value) => {
                                        setNameInput(value);
                                        setNameSaveError(null);
                                    }}
                                    autoCapitalize="words"
                                    returnKeyType="done"
                                    editable={!savingProfile}
                                    onSubmitEditing={() => {
                                        void handleSaveProfile();
                                    }}
                                />
                                {nameSaveError ? (
                                    <Text style={styles.editProfileWarningText}>{nameSaveError}</Text>
                                ) : null}
                                <View style={styles.editProfileActions}>
                                    <Button
                                        title="Cancelar"
                                        variant="outline"
                                        onPress={handleCancelEditProfile}
                                        style={styles.editProfileButton}
                                    />
                                    <Button
                                        title={savingProfile ? 'Salvando...' : 'Salvar'}
                                        onPress={() => {
                                            void handleSaveProfile();
                                        }}
                                        style={styles.editProfileButton}
                                    />
                                </View>
                            </View>
                        ) : null}

                        {editingPassword ? (
                            <View style={styles.editProfileContainer}>
                                <Text style={styles.editProfileTitle}>Alterar senha</Text>
                                <Input
                                    label="Senha atual"
                                    value={currentPasswordInput}
                                    onChangeText={(value) => {
                                        setCurrentPasswordInput(value);
                                        setPasswordSaveError(null);
                                    }}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    editable={!savingPassword}
                                />
                                <Input
                                    label="Nova senha"
                                    value={newPasswordInput}
                                    onChangeText={(value) => {
                                        setNewPasswordInput(value);
                                        setPasswordSaveError(null);
                                    }}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    editable={!savingPassword}
                                />
                                <Input
                                    label="Confirmar nova senha"
                                    value={confirmPasswordInput}
                                    onChangeText={(value) => {
                                        setConfirmPasswordInput(value);
                                        setPasswordSaveError(null);
                                    }}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    editable={!savingPassword}
                                    onSubmitEditing={() => {
                                        void handleSavePassword();
                                    }}
                                />
                                {passwordSaveError ? (
                                    <Text style={styles.editProfileWarningText}>{passwordSaveError}</Text>
                                ) : null}
                                <View style={styles.editProfileActions}>
                                    <Button
                                        title="Cancelar"
                                        variant="outline"
                                        onPress={handleCancelEditPassword}
                                        style={styles.editProfileButton}
                                    />
                                    <Button
                                        title={savingPassword ? 'Salvando...' : 'Salvar'}
                                        onPress={() => {
                                            void handleSavePassword();
                                        }}
                                        style={styles.editProfileButton}
                                    />
                                </View>
                            </View>
                        ) : null}

                        <View style={styles.statsContainer}>
                            <StatCard number={String(profile?.stats.occurrences ?? 0)} label="OCORRÊNCIAS" />
                            <StatCard number={String(profile?.stats.supports ?? 0)} label="APOIOS" />
                        </View>

                        <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Minhas Ocorrências</Text>
                                {hasMoreOccurrences ? (
                                    <TouchableOpacity onPress={() => setShowAllOccurrences((currentValue) => !currentValue)}>
                                        <Text style={styles.seeAllText}>
                                            {showAllOccurrences ? 'Ver menos' : 'Ver tudo'}
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>

                            {visibleOccurrences.length ? (
                                visibleOccurrences.map((occurrence) => (
                                    <OccurrenceCard
                                        key={occurrence.id}
                                        imageUrl={occurrence.photos[0]}
                                        title={occurrence.title}
                                        subtitle={`${formatTimeAgo(occurrence.createdAt)} • ${occurrence.category}`}
                                        status={statusLabels[occurrence.status]}
                                        onPress={() => setSelectedOccurrence(occurrenceToDetails(occurrence))}
                                    />
                                ))
                            ) : (
                                <Text style={styles.emptyStateText}>Nenhuma ocorrência criada por você.</Text>
                            )}
                        </View>
                    </>
                )}

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitleOptions}>Configurações</Text>

                    <View style={styles.optionsContainer}>
                        {settingsOptions.map((option) => (
                            <SettingsOption
                                key={option.text}
                                icon={option.icon}
                                text={option.text}
                                showDivider={option.showDivider}
                                isDanger={option.isDanger}
                                onPress={option.onPress}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
            <Toast position="top" bottomOffset={20} />
        </SafeAreaView>
    );
}
