import NoticeModal from '@/components/NoticeModal';
import { useAuth } from '@/contexts/AuthContext';
import palette from '@/style/colors';
import { globalStyles } from '@/style/global';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ModalState = {
    visible: boolean;
    title: string;
    message: string;
    variant: 'info' | 'success' | 'warning' | 'error';
    primaryAction: {
        label: string;
        onPress: () => void;
        variant?: 'primary' | 'secondary' | 'danger';
    };
    secondaryAction?: {
        label: string;
        onPress: () => void;
        variant?: 'primary' | 'secondary' | 'danger';
    };
};

const hiddenModalState: ModalState = {
    visible: false,
    title: '',
    message: '',
    variant: 'info',
    primaryAction: {
        label: 'Fechar',
        onPress: () => undefined,
    },
};

export default function Signin() {
    const {
        isAuthenticated,
        signIn,
        signInWithBiometrics,
        enableBiometricLogin,
        isBiometricAvailable,
        isBiometricEnabled,
        pauseAuthRedirect,
        resumeAuthRedirect,
        shouldOfferBiometricEnrollment,
    } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<ModalState>(hiddenModalState);
    const [hasAttemptedAutoBiometric, setHasAttemptedAutoBiometric] = useState(false);
    const biometricDisabled = loading || !isBiometricAvailable || !isBiometricEnabled;

    function closeModal() {
        setModal(hiddenModalState);
    }

    function navigateToTabs() {
        closeModal();
        resumeAuthRedirect();
        router.replace('/(tabs)');
    }

    function showErrorModal(message: string) {
        resumeAuthRedirect();
        setModal({
            visible: true,
            title: 'Algo deu errado',
            message,
            variant: 'error',
            primaryAction: {
                label: 'Entendi',
                onPress: closeModal,
            },
        });
    }

    async function askToEnableBiometrics() {
        const shouldOffer = await shouldOfferBiometricEnrollment();

        if (!shouldOffer) {
            navigateToTabs();
            return;
        }

        setModal({
            visible: true,
            title: 'Ativar login com biometria?',
            message: 'Nos próximos acessos você poderá entrar usando a biometria do dispositivo.',
            variant: 'info',
            primaryAction: {
                label: 'Ativar',
                onPress: () => {
                    void (async () => {
                        try {
                            closeModal();
                            const enabled = await enableBiometricLogin({
                                email: email.trim(),
                                password,
                            });

                            if (enabled) {
                                setModal({
                                    visible: true,
                                    title: 'Tudo certo',
                                    message: 'Login com biometria ativado com sucesso.',
                                    variant: 'success',
                                    primaryAction: {
                                        label: 'Continuar',
                                        onPress: navigateToTabs,
                                    },
                                });
                                return;
                            }

                            navigateToTabs();
                        } catch (err: any) {
                            const msg = err?.message || 'Não foi possí­vel ativar o login com biometria.';

                            setModal({
                                visible: true,
                                title: 'Não foi possí­vel ativar',
                                message: msg,
                                variant: 'error',
                                primaryAction: {
                                    label: 'Continuar',
                                    onPress: navigateToTabs,
                                },
                            });
                        }
                    })();
                },
            },
            secondaryAction: {
                label: 'Agora não',
                variant: 'secondary',
                onPress: navigateToTabs,
            },
        });
    }

    async function handleSignIn() {
        try {
            setLoading(true);
            pauseAuthRedirect();
            await signIn({ email: email.trim(), password });
            await askToEnableBiometrics();
        } catch (err: any) {
            const msg =
                err?.response?.data?.message?.toString?.() ||
                err?.message ||
                'Falha ao entrar. Verifique e-mail e senha.';
            showErrorModal(msg);
        } finally {
            setLoading(false);
        }
    }

    async function handleBiometricSignIn() {
        try {
            setLoading(true);
            pauseAuthRedirect();
            await signInWithBiometrics();
            navigateToTabs();
        } catch (err: any) {
            const msg = err?.message || 'Não foi possí­vel entrar com biometria.';
            showErrorModal(msg);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (
            loading ||
            modal.visible ||
            isAuthenticated ||
            hasAttemptedAutoBiometric ||
            !isBiometricAvailable ||
            !isBiometricEnabled
        ) {
            return;
        }

        setHasAttemptedAutoBiometric(true);

        void (async () => {
            try {
                setLoading(true);
                pauseAuthRedirect();
                await signInWithBiometrics();
                closeModal();
                resumeAuthRedirect();
                router.replace('/(tabs)');
            } catch (err: any) {
                resumeAuthRedirect();
                setModal({
                    visible: true,
                    title: 'Algo deu errado',
                    message: err?.message || 'Não foi possível entrar com biometria.',
                    variant: 'error',
                    primaryAction: {
                        label: 'Entendi',
                        onPress: closeModal,
                    },
                });
            } finally {
                setLoading(false);
            }
        })();
    }, [
        hasAttemptedAutoBiometric,
        isAuthenticated,
        isBiometricAvailable,
        isBiometricEnabled,
        loading,
        modal.visible,
        pauseAuthRedirect,
        resumeAuthRedirect,
        signInWithBiometrics,
    ]);

    return (
        <SafeAreaView style={[globalStyles.container, { justifyContent: 'center' }]}>
            <TextInput
                style={style.input}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#8B90A0"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!loading}
            />
            <TextInput
                style={style.input}
                placeholder="Digite sua senha"
                placeholderTextColor="#8B90A0"
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
            />

            <Pressable style={style.btn} onPress={handleSignIn} disabled={loading}>
                <Text style={style.btnText}>{loading ? 'Entrando...' : 'Fazer Login'}</Text>
            </Pressable>

            <Pressable style={[style.biometricBtn, biometricDisabled && style.disabledBtn]} onPress={handleBiometricSignIn} disabled={biometricDisabled}>
                <FontAwesome5 name="fingerprint" size={24} color={palette.darkBlue} />
                <Text style={[style.biometricText, biometricDisabled && style.disabledText]}>Entrar com Biometria</Text>
            </Pressable>

            {!isBiometricAvailable && (
                <Text style={style.helperText}>Cadastre uma biometria no dispositivo para habilitar esse acesso.</Text>
            )}

            {isBiometricAvailable && !isBiometricEnabled && (
                <Text style={style.helperText}>Faça login com e-mail e senha uma vez para ativar a biometria.</Text>
            )}

            <Text style={style.linkText}>Não possui uma conta?<Link href="/(auth)/sign-up" style={style.linkStrong}> Cadastre-se</Link></Text>

            <NoticeModal
                visible={modal.visible}
                title={modal.title}
                message={modal.message}
                variant={modal.variant}
                primaryAction={modal.primaryAction}
                secondaryAction={modal.secondaryAction}
                onRequestClose={closeModal}
            />
        </SafeAreaView>
    );
}

const style = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: palette.darkGrey,
        borderRadius: 2,
        backgroundColor: palette.white,
        paddingHorizontal: 15,
        paddingVertical: 12,
        color: palette.black,
    },
    btn: {
        backgroundColor: palette.darkBlue,
        padding: 14,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: palette.white,
        fontWeight: '700',
    },
    biometricBtn: {
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        borderWidth: 2,
        borderColor: palette.darkBlue,
        backgroundColor: '#F5F8FF',
        padding: 10,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    biometricText: {
        color: palette.darkBlue,
        fontWeight: '700',
    },
    disabledBtn: {
        opacity: 0.5,
    },
    disabledText: {
        color: palette.black,
    },
    helperText: {
        textAlign: 'center',
        color: palette.black,
        lineHeight: 20,
    },
    linkText: {
        marginTop: 30,
        textAlign: 'center',
        color: palette.black,
    },
    linkStrong: {
        fontWeight: 'bold',
        color: palette.darkBlue,
    },
});

