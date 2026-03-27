import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../style/colors';
import { spacing } from '../style/spacing';

interface CameraComponentProps {
    onCapture?: (uri: string) => void;
    onClose?: () => void;
}

export function Camera({ onCapture, onClose }: CameraComponentProps) {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
                <Text style={styles.permissionTitle}>Acesso à Câmera</Text>
                <Text style={styles.permissionText}>
                    Precisamos da sua permissão para usar a câmera e registrar evidências da ocorrência.
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Conceder Permissão</Text>
                </TouchableOpacity>
                {onClose && (
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    const toggleFacing = () => {
        setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
    };

    const takePicture = async () => {
        if (!cameraRef.current) return;
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
            if (photo) {
                setCapturedPhoto(photo.uri);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível capturar a foto. Tente novamente.');
        }
    };

    const confirmPhoto = () => {
        if (capturedPhoto && onCapture) {
            onCapture(capturedPhoto);
        }
    };

    const retakePhoto = () => {
        setCapturedPhoto(null);
    };

    // Preview of captured photo
    if (capturedPhoto) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: capturedPhoto }} style={styles.preview} />
                <View style={styles.previewControls}>
                    <TouchableOpacity style={styles.previewButton} onPress={retakePhoto}>
                        <Ionicons name="refresh" size={24} color={colors.text} />
                        <Text style={styles.previewButtonText}>Tirar outra</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.previewButton, styles.confirmButton]}
                        onPress={confirmPhoto}
                    >
                        <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                        <Text style={[styles.previewButtonText, { color: '#FFFFFF' }]}>Usar foto</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Camera viewfinder
    return (
        <View style={styles.container}>
            <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
                {/* Top bar */}
                <View style={styles.topBar}>
                    {onClose && (
                        <TouchableOpacity style={styles.topButton} onPress={onClose}>
                            <Ionicons name="close" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Bottom controls */}
                <View style={styles.bottomBar}>
                    <View style={styles.controlsRow}>
                        {/* Spacer */}
                        <View style={styles.sideButton} />

                        {/* Shutter */}
                        <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
                            <View style={styles.shutterInner} />
                        </TouchableOpacity>

                        {/* Flip */}
                        <TouchableOpacity style={styles.sideButton} onPress={toggleFacing}>
                            <Ionicons name="camera-reverse-outline" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    camera: {
        flex: 1,
        justifyContent: 'space-between',
    },

    // Permission screen
    permissionContainer: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    permissionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    permissionText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.xl,
    },
    permissionButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.md,
    },
    permissionButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    cancelButtonText: {
        color: colors.textSecondary,
        fontSize: 14,
    },

    // Top bar
    topBar: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: spacing.md,
        paddingTop: spacing.xxl,
    },
    topButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Bottom bar
    bottomBar: {
        paddingBottom: spacing.xxl,
        paddingHorizontal: spacing.lg,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sideButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shutterButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    shutterInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
    },

    // Photo preview
    preview: {
        flex: 1,
        resizeMode: 'contain',
    },
    previewControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.md,
        backgroundColor: '#000000',
    },
    previewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 12,
        backgroundColor: colors.surface,
        gap: spacing.sm,
    },
    previewButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
    },
    confirmButton: {
        backgroundColor: colors.primary,
    },
});
