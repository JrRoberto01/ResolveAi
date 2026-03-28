import NoticeModal from "@/components/NoticeModal";
import { useAuth } from "@/contexts/AuthContext";
import colors from "@/style/colors";
import { styles } from "@/style/global";
import { Link, router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ModalState = {
    visible: boolean;
    title: string;
    message: string;
    variant: "info" | "success" | "warning" | "error";
    primaryAction: {
        label: string;
        onPress: () => void;
        variant?: "primary" | "secondary" | "danger";
    };
    secondaryAction?: {
        label: string;
        onPress: () => void;
        variant?: "primary" | "secondary" | "danger";
    };
};

const hiddenModalState: ModalState = {
    visible: false,
    title: "",
    message: "",
    variant: "info",
    primaryAction: {
        label: "Fechar",
        onPress: () => undefined,
    },
};

export default function Signin() {
    const {
        signIn,
        signInWithBiometrics,
        enableBiometricLogin,
        isBiometricAvailable,
        isBiometricEnabled,
    } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<ModalState>(hiddenModalState);

    const biometricDisabled = useMemo(
        () => loading || !isBiometricAvailable || !isBiometricEnabled,
        [loading, isBiometricAvailable, isBiometricEnabled],
    );

    function closeModal() {
        setModal(hiddenModalState);
    }

    function navigateToTabs() {
        closeModal();
        router.replace("/(tabs)");
    }

    function showErrorModal(message: string) {
        setModal({
            visible: true,
            title: "Algo deu errado",
            message,
            variant: "error",
            primaryAction: {
                label: "Entendi",
                onPress: closeModal,
            },
        });
    }

    function askToEnableBiometrics() {
        if (!isBiometricAvailable || isBiometricEnabled) {
            router.replace("/(tabs)");
            return;
        }

        setModal({
            visible: true,
            title: "Ativar login com biometria?",
            message: "Nos proximos acessos voce podera entrar usando a biometria do dispositivo.",
            variant: "info",
            primaryAction: {
                label: "Ativar",
                onPress: () => {
                    void (async () => {
                        try {
                            closeModal();
                            const enabled = await enableBiometricLogin();

                            if (enabled) {
                                setModal({
                                    visible: true,
                                    title: "Tudo certo",
                                    message: "Login com biometria ativado com sucesso.",
                                    variant: "success",
                                    primaryAction: {
                                        label: "Continuar",
                                        onPress: navigateToTabs,
                                    },
                                });
                                return;
                            }

                            router.replace("/(tabs)");
                        } catch (err: any) {
                            const msg =
                                err?.message ||
                                "Nao foi possivel ativar o login com biometria.";

                            setModal({
                                visible: true,
                                title: "Nao foi possivel ativar",
                                message: msg,
                                variant: "error",
                                primaryAction: {
                                    label: "Continuar",
                                    onPress: navigateToTabs,
                                },
                            });
                        }
                    })();
                },
            },
            secondaryAction: {
                label: "Agora nao",
                variant: "secondary",
                onPress: navigateToTabs,
            },
        });
    }

    async function handleSignIn() {
        try {
            setLoading(true);
            await signIn({ email: email.trim(), password });
            askToEnableBiometrics();
        } catch (err: any) {
            const msg =
                err?.response?.data?.message?.toString?.() ||
                err?.message ||
                "Falha ao entrar. Verifique e-mail e senha.";
            showErrorModal(msg);
        } finally {
            setLoading(false);
        }
    }

    async function handleBiometricSignIn() {
        try {
            setLoading(true);
            await signInWithBiometrics();
            router.replace("/(tabs)");
        } catch (err: any) {
            const msg =
                err?.message ||
                "Nao foi possivel entrar com biometria.";
            showErrorModal(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
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
                <Text style={style.btnText}>{loading ? "Entrando..." : "Fazer Login"}</Text>
            </Pressable>

            <Pressable style={[style.biometricBtn, biometricDisabled && style.disabledBtn]} onPress={handleBiometricSignIn} disabled={biometricDisabled} >
                <Text style={[style.biometricText, biometricDisabled && style.disabledText]}>Login com biometria</Text>
            </Pressable>

            {!isBiometricAvailable && (
                <Text style={style.helperText}>Cadastre uma biometria no dispositivo para habilitar esse acesso.</Text>
            )}

            {isBiometricAvailable && !isBiometricEnabled && (
                <Text style={style.helperText}>Faca login com e-mail e senha uma vez para ativar a biometria.</Text>
            )}

            <Text style={style.linkText}>Nao possui uma conta? <Link href="/(auth)/sign-up" style={style.linkStrong}> Cadastre-se</Link></Text>

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
        borderColor: colors.darkGrey,
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: colors.black,
    },
    btn: {
        backgroundColor: colors.darkBlue,
        padding: 14,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    btnText: {
        color: colors.white,
        fontWeight: "700",
    },
    biometricBtn: {
        borderWidth: 1,
        borderColor: colors.darkBlue,
        backgroundColor: "#F5F8FF",
        padding: 14,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    biometricText: {
        color: colors.darkBlue,
        fontWeight: "700",
    },
    disabledBtn: {
        opacity: 0.5,
    },
    disabledText: {
        color: colors.black,
    },
    helperText: {
        textAlign: "center",
        color: colors.black,
        lineHeight: 20,
    },
    linkText: {
        textAlign: "center",
        color: colors.black,
    },
    linkStrong: {
        fontWeight: "bold",
    },
});
