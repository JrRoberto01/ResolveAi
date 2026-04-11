import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../style/colors';
import { styles } from './CameraStyle';

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
                {onClose ? (
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                ) : null}
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
        } catch {
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

    return (
        <View style={styles.container}>
            <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
                <View style={styles.topBar}>
                    {onClose ? (
                        <TouchableOpacity style={styles.topButton} onPress={onClose}>
                            <Ionicons name="close" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <View style={styles.bottomBar}>
                    <View style={styles.controlsRow}>
                        <View style={styles.sideButton} />

                        <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
                            <View style={styles.shutterInner} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sideButton} onPress={toggleFacing}>
                            <Ionicons name="camera-reverse-outline" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}
