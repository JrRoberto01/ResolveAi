import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { colors } from '../style/colors';

interface LocationPickerProps {
    onLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void;
    initialLocation?: { latitude: number; longitude: number; address?: string };
}

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
    const defaultCoords = initialLocation?.latitude ? initialLocation : {
        latitude: -22.4044,
        longitude: -43.6633,
    };

    const [mapRegion, setMapRegion] = useState({
        ...defaultCoords,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    const [markerCoord, setMarkerCoord] = useState<{ latitude: number, longitude: number } | null>(
        initialLocation?.latitude ? initialLocation : null
    );
    const [addressText, setAddressText] = useState<string | null>(initialLocation?.address || null);

    const getAddressFromCoords = async (coord: { latitude: number, longitude: number }) => {
        try {
            const [place] = await Location.reverseGeocodeAsync(coord);
            if (place) {
                const { street, streetNumber, district, subregion, city, region } = place;
                const cityState = `${subregion || city || 'Localidade Desconhecida'} - ${region || 'BR'}`;

                if (street) return `${street}${streetNumber ? ', ' + streetNumber : ''} - ${cityState}`;
                if (district) return `${district} - ${cityState}`;
                return cityState;
            }
        } catch (e) {
            console.log("Erro no reverse geocode", e);
        }
        return 'Local marcado no mapa';
    };

    const handlePress = async (e: any) => {
        const coord = e.nativeEvent.coordinate;
        setMarkerCoord(coord);

        const address = await getAddressFromCoords(coord);
        setAddressText(address);
        onLocationSelect({ ...coord, address });
    };

    const handleGetCurrentLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Precisamos da permissão de localização para obter o seu local atual.');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const coord = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };

            setMarkerCoord(coord);
            setMapRegion({
                ...coord,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });

            const address = await getAddressFromCoords(coord);
            setAddressText(address);
            onLocationSelect({ ...coord, address });
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível obter a localização atual.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.label}>Local do Problema</Text>
                <TouchableOpacity onPress={handleGetCurrentLocation} style={styles.useCurrentButton}>
                    <Ionicons name="location" size={20} color={colors.primary} />
                    <Text style={styles.useCurrentText}>Usar atual</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    region={mapRegion}
                    onRegionChangeComplete={setMapRegion}
                    onPress={handlePress}
                >
                    {markerCoord && <Marker coordinate={markerCoord} />}
                </MapView>
            </View>
            <Text style={styles.hint}>
                {addressText ? `🗺️ ${addressText}` : 'Toque no mapa para marcar o local exato.'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
    },
    useCurrentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    useCurrentText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
    },
    mapContainer: {
        height: 200,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    map: {
        flex: 1,
    },
    hint: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
    }
});
