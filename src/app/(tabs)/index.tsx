import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { Alert, FlatList, Modal, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AnonymousSwitch } from "../../components/AnonymousSwitch";
import { Button } from "../../components/Button";
import { Camera } from "../../components/Camera";
import { CardOcorrencia, Ocorrencia } from "../../components/CardOcorrencia";
import { CategorySelector } from "../../components/CategorySelector";
import { FAB } from "../../components/FAB";
import { Header } from "../../components/Header";
import { Input } from "../../components/Input";
import { LocationPicker } from "../../components/LocationPicker";
import { PhotoUploadBox } from "../../components/PhotoUploadBox";
import { SearchBar } from "../../components/SearchBar";
import { useFavorites } from "../../contexts/FavoritesContext";
import { globalStyles } from "../../style/global";
import { spacing } from "../../style/spacing";

type OccurrenceFormProps = {
  initialData?: Ocorrencia | null;
  onAddItem: (item: Ocorrencia) => void;
  onEditItem: (item: Ocorrencia) => void;
  onDeleteItem: (id: string) => void;
  onBack: () => void;
};

const ALL_CATEGORIES = [
  "Todos",
  "Buraco na via",
  "Iluminação pública",
  "Lixo / Entulho",
  "Vazamento",
  "Alagamento",
];

const FORM_CATEGORIES = ALL_CATEGORIES.filter((category) => category !== "Todos");

function OccurrenceForm({
  initialData,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onBack,
}: OccurrenceFormProps) {
  const isEditing = !!initialData;
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState(initialData?.category ?? FORM_CATEGORIES[0]);
  const [isAnonymous, setIsAnonymous] = useState(initialData?.anonymous ?? false);
  const [location, setLocation] = useState<any>(initialData?.location ?? null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>(initialData?.photos ?? []);

  function handlePhotoCapture(uri: string) {
    setPhotos((currentPhotos) => [...currentPhotos, uri]);
    setCameraOpen(false);
  }

  function handleSave() {
    if (!title.trim()) {
      return;
    }

    if (isEditing && initialData) {
      onEditItem({
        ...initialData,
        title,
        description,
        category,
        anonymous: isAnonymous,
        location: location ?? initialData.location,
        photos,
        imageUrl: photos.length > 0 ? { uri: photos[0] } : initialData.imageUrl,
      });
      return;
    }

    onAddItem({
      id: uuidv4(),
      title,
      description,
      category,
      anonymous: isAnonymous,
      location: location ?? "Avenida Fictícia, 123",
      likes: 0,
      comments: 0,
      timeAgo: "Agora mesmo",
      status: "EM ANÁLISE",
      photos,
      imageUrl: photos.length > 0 ? { uri: photos[0] } : undefined,
    });
  }

  function handleDelete() {
    if (!initialData) {
      return;
    }

    Alert.alert(
      "Excluir Ocorrência",
      "Tem certeza que deseja apagar esta ocorrência?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => onDeleteItem(initialData.id),
        },
      ],
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: globalStyles.container.backgroundColor }}>
      <Header title={isEditing ? "Editar Ocorrência" : "Nova Ocorrência"} showBack onBack={onBack} />

      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <AnonymousSwitch value={isAnonymous} onValueChange={setIsAnonymous} />

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
          label="Categoria"
          categories={FORM_CATEGORIES}
          activeCategory={category}
          onSelect={setCategory}
        />

        <PhotoUploadBox
          label="Evidências (fotos)"
          onPress={() => setCameraOpen(true)}
          photos={photos}
        />

        <LocationPicker onLocationSelect={setLocation} initialLocation={location} />

        <Button
          title={isEditing ? "Salvar alterações" : "Publicar ocorrência"}
          onPress={handleSave}
          style={{ marginTop: spacing.md, marginBottom: isEditing ? spacing.md : spacing.xxl }}
        />

        {isEditing ? (
          <Button
            title="Excluir ocorrência"
            variant="danger"
            onPress={handleDelete}
            style={{ marginBottom: spacing.xxl }}
          />
        ) : null}
      </ScrollView>

      <Modal visible={cameraOpen} animationType="slide">
        <Camera onCapture={handlePhotoCapture} onClose={() => setCameraOpen(false)} />
      </Modal>
    </View>
  );
}

export default function Index() {
  const [listItems, setListItems] = useState<Ocorrencia[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES[0]);
  const [editingItem, setEditingItem] = useState<Ocorrencia | null>(null);
  const [searchText, setSearchText] = useState("");
  const { toggleSupport, isSupported } = useFavorites();

  React.useEffect(() => {
    AsyncStorage.getItem("@ocorrencias").then((stored) => {
      if (stored) {
        setListItems(JSON.parse(stored));
      }
    }).catch(console.error);
  }, []);

  const filteredItems = listItems.filter((item) => {
    const matchesCategory = activeCategory === ALL_CATEGORIES[0] || item.category === activeCategory;
    const matchesSearch = !searchText.trim() || item.title.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function handleAddItem(newItem: Ocorrencia) {
    setListItems((currentItems) => {
      const newItems = [newItem, ...currentItems];
      AsyncStorage.setItem("@ocorrencias", JSON.stringify(newItems)).catch(console.error);
      return newItems;
    });
    setIsAdding(false);
    Toast.show({ type: "success", text1: "Sucesso", text2: "Sua ocorrência foi publicada!" });
  }

  function handleEditItem(updatedItem: Ocorrencia) {
    setListItems((currentItems) => {
      const newItems = currentItems.map((item) => (item.id === updatedItem.id ? updatedItem : item));
      AsyncStorage.setItem("@ocorrencias", JSON.stringify(newItems)).catch(console.error);
      return newItems;
    });
    setEditingItem(null);
    Toast.show({ type: "success", text1: "Atualizada", text2: "A ocorrência foi atualizada!" });
  }

  function handleDeleteItem(id: string) {
    setListItems((currentItems) => {
      const newItems = currentItems.filter((item) => item.id !== id);
      AsyncStorage.setItem("@ocorrencias", JSON.stringify(newItems)).catch(console.error);
      return newItems;
    });
    setEditingItem(null);
    Toast.show({ type: "success", text1: "Excluída", text2: "A ocorrência foi removida permanentemente." });
  }

  if (isAdding || editingItem) {
    return (
      <View style={{ flex: 1, backgroundColor: globalStyles.container.backgroundColor }}>
        <OccurrenceForm
          initialData={editingItem}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onBack={() => {
            setIsAdding(false);
            setEditingItem(null);
          }}
        />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: globalStyles.container.backgroundColor }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Resolve Aí" showNotification />

      <View style={{ padding: spacing.md, paddingBottom: 0 }}>
        <SearchBar
          placeholder="Buscar ocorrências..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <CategorySelector
          horizontal
          categories={ALL_CATEGORIES}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </View>

      <View style={{ flex: 1, width: "100%" }}>
        <FlatList
          data={filteredItems}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CardOcorrencia
              data={item}
              onPressSupport={() => toggleSupport(item)}
              onPressEdit={() => setEditingItem(item)}
              isSupported={isSupported(item.id)}
            />
          )}
        />
      </View>

      <FAB onPress={() => setIsAdding(true)} />

      <StatusBar style="auto" />
      <Toast position="top" bottomOffset={20} />
    </View>
  );
}
