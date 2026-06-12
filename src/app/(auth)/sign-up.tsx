import NoticeModal from '@/components/NoticeModal';
import { useAuth } from '@/contexts/AuthContext';
import palette from '@/style/colors';
import { globalStyles } from '@/style/global';
import { Link, router } from 'expo-router';
import { useState } from 'react';
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

export default function Signup() {
    const {
        signUp,
        signIn,
        enableBiometricLogin,
        pauseAuthRedirect,
        resumeAuthRedirect,
        shouldOfferBiometricEnrollment,
    } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<ModalState>(hiddenModalState);

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
            message: 'Sua conta foi criada. Deseja liberar os próximos acessos com a biometria do dispositivo?',
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

    async function handleSignUp() {
        try {
            setLoading(true);
            pauseAuthRedirect();
            await signUp({ name: name.trim(), email: email.trim(), password });
            await signIn({ email: email.trim(), password });
            const shouldOffer = await shouldOfferBiometricEnrollment();

            setModal({
                visible: true,
                title: 'Bem-vindo!',
                message: shouldOffer
                    ? 'Sua conta foi criada com sucesso. Deseja ativar o login com biometria agora?'
                    : 'Sua conta foi criada com sucesso.',
                variant: 'success',
                primaryAction: shouldOffer
                    ? {
                          label: 'Ativar biometria',
                          onPress: () => {
                              void askToEnableBiometrics();
                          },
                      }
                    : {
                          label: 'Continuar',
                          onPress: navigateToTabs,
                      },
                secondaryAction: shouldOffer
                    ? {
                          label: 'Agora não',
                          variant: 'secondary',
                          onPress: navigateToTabs,
                      }
                    : undefined,
            });
        } catch (err: any) {
            const msg =
                err?.response?.data?.message?.toString?.() ||
                err?.message ||
                'Falha ao cadastrar.';
            showErrorModal(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={[globalStyles.container, { justifyContent: 'center' }]}>
            <TextInput
                style={style.input}
                placeholder="Digite seu nome"
                placeholderTextColor="#8B90A0"
                autoCapitalize="words"
                autoCorrect={false}
                value={name}
                onChangeText={setName}
                editable={!loading}
            />
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
            <Pressable style={style.btn} onPress={handleSignUp} disabled={loading}>
                <Text style={style.btnText}>{loading ? 'Criando conta...' : 'Criar conta'}</Text>
            </Pressable>

            <Text style={style.linkText}>JÃ¡ possui uma conta?<Link href="/(auth)/sign-in" style={style.linkStrong}> Entre agora</Link></Text>

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
        backgroundColor: palette.white,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 2,
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

