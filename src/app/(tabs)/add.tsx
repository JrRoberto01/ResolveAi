import "react-native-get-random-values";
import React, { useState } from 'react';
import { View, ScrollView, Alert } from "react-native";
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { AnonymousSwitch } from '../../components/AnonymousSwitch';
import { CategorySelector } from '../../components/CategorySelector';
import { LocationPicker } from '../../components/LocationPicker';
import { PhotoUploadBox } from '../../components/PhotoUploadBox';
import { colors } from '../../style/colors';
import { spacing } from '../../style/spacing';
import { v4 as uuidv4 } from 'uuid';

export default function AddItem(props: any) {
    const isEditing = !!props.initialData;

    const [title, setTitle] = useState(isEditing ? props.initialData.title : '');
    const [description, setDescription] = useState(isEditing ? props.initialData.description : '');
    const [category, setCategory] = useState(isEditing ? props.initialData.category : 'Buraco na via');
    const [isAnonymous, setIsAnonymous] = useState(isEditing ? props.initialData.anonymous : false);
    const [location, setLocation] = useState<any>(isEditing ? props.initialData.location : null);

    const categories = ['Buraco na via', 'Iluminação pública', 'Lixo / Entulho', 'Vazamento', 'Alagamento'];

    const handleSave = () => {
        if (!title.trim()) return;
        
        if (isEditing) {
            props.onEditItem({
                ...props.initialData,
                title,
                description,
                category,
                anonymous: isAnonymous,
                location: location || props.initialData.location
            });
        } else {
            const newItem = {
                id: uuidv4(),
                title,
                description,
                category,
                anonymous: isAnonymous,
                location: location || 'Avenida Fictícia, 123', // mock fallback
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
