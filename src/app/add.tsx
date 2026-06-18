import "react-native-get-random-values";
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert } from "react-native";
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AnonymousSwitch } from '../components/AnonymousSwitch';
import { CategorySelector } from '../components/CategorySelector';
import { LocationPicker } from '../components/LocationPicker';
import { PhotoUploadBox } from '../components/PhotoUploadBox';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { v4 as uuidv4 } from 'uuid';
import { getOccurrenceCategories } from '../api/occurrences.api';

export default function AddItem(props: any) {
    const isEditing = !!props.initialData;

    const [title, setTitle] = useState(isEditing ? props.initialData.title : '');
    const [description, setDescription] = useState(isEditing ? props.initialData.description : '');
    const [categories, setCategories] = useState<string[]>([]);
    const [category, setCategory] = useState(isEditing ? props.initialData.category : '');
    const [isAnonymous, setIsAnonymous] = useState(isEditing ? props.initialData.anonymous : false);
    const [location, setLocation] = useState<any>(isEditing ? props.initialData.location : null);

    useEffect(() => {
        let isMounted = true;

        async function loadCategories() {
            try {
                const loadedCategories = await getOccurrenceCategories();

                if (isMounted) {
                    setCategories(loadedCategories);
                    setCategory((currentCategory) =>
                        currentCategory && loadedCategories.includes(currentCategory)
                            ? currentCategory
                            : loadedCategories[0] || '',
                    );
                }
            } catch {
                if (isMounted) {
                    setCategories([]);
                }
            }
        }

        void loadCategories();

        return () => {
            isMounted = false;
        };
    }, []);

    function hasMapLocation(value: any) {
        return !!value && typeof value === 'object' && typeof value.latitude === 'number' && typeof value.longitude === 'number';
    }

    const handleSave = () => {
        if (!title.trim()) return;

        if (!category) {
            Alert.alert('Categoria obrigatória', 'Selecione uma categoria para a ocorrência.');
            return;
        }

        const selectedLocation = location || props.initialData?.location;

        if (!hasMapLocation(selectedLocation)) {
            Alert.alert('Local obrigatório', 'Toque no mapa ou use sua localização atual para marcar a ocorrência.');
            return;
        }
        
        if (isEditing) {
            props.onEditItem({
                ...props.initialData,
                title,
                description,
                category,
                anonymous: isAnonymous,
                location: selectedLocation
            });
        } else {
            const newItem = {
                id: uuidv4(),
                title,
                description,
                category,
                anonymous: isAnonymous,
                location: selectedLocation,
                likes: 0,
                comments: 0,
                timeAgo: 'Agora mesmo',
                status: 'EM ANÁLISE'
            };
            props.onAddItem(newItem);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Excluir Ocorrência",
            "Tem certeza que deseja apagar esta ocorrência?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Excluir", 
                    style: "destructive",
                    onPress: () => props.onDeleteItem(props.initialData.id)
                }
            ]
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title={isEditing ? "Editar Ocorrência" : "Nova Ocorrência"} showBack onBack={props.onBack} />
            
            <ScrollView contentContainerStyle={{ padding: spacing.md }}>
                
                <AnonymousSwitch 
                    value={isAnonymous}
                    onValueChange={setIsAnonymous}
                />

                <Input 
                    label="Título do Problema"
                    placeholder="Ex: Buraco no meio da rua"
                    value={title}
                    onChangeText={setTitle}
                />

                <Input 
                    label="Descrição Detalhada"
                    placeholder="Descreva o que está acontecendo e como isso afeta a vizinhança..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <CategorySelector 
                    label="CATEGORIA"
                    categories={categories}
                    activeCategory={category}
                    onSelect={setCategory}
                />

                <PhotoUploadBox label="EVIDÊNCIAS (FOTOS)" />

                <LocationPicker 
                    onLocationSelect={setLocation} 
                    initialLocation={location} 
                />

                <Button 
                    title={isEditing ? "Salvar alterações" : "Publicar ocorrência"} 
                    onPress={handleSave} 
                    style={{ marginTop: spacing.md, marginBottom: isEditing ? spacing.md : spacing.xxl }} 
                />

                {isEditing && (
                    <Button 
                        title="Excluir Ocorrência" 
                        variant="danger"
                        onPress={handleDelete} 
                        style={{ marginBottom: spacing.xxl }} 
                    />
                )}

            </ScrollView>
        </View>
    );
}
