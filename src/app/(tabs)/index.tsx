import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { File } from "expo-file-system";
import React, { useCallback, useState } from "react";
import "react-native-get-random-values";
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import {
  createOccurrence,
  deleteOccurrence,
  getOccurrences,
  toggleOccurrenceSupport,
  updateOccurrence,
} from "../../api/occurrences.api";
import type { ApiOccurrence, OccurrencePayload } from "../../api/occurrences.api";
import { AnonymousSwitch } from "../../components/AnonymousSwitch";
import { Button } from "../../components/Button";
import { Camera } from "../../components/Camera";
import { CardOcorrencia, Ocorrencia } from "../../components/CardOcorrencia";
import { CategorySelector } from "../../components/CategorySelector";
import { FAB } from "../../components/FAB";
import { Header } from "../../components/Header";
import { Input } from "../../components/Input";
import { LocationPicker } from "../../components/LocationPicker";
import { OccurrenceDetails } from "../../components/OccurrenceDetails";
import { PhotoUploadBox } from "../../components/PhotoUploadBox";
import { SearchBar } from "../../components/SearchBar";
import { globalStyles } from "../../style/global";
import { spacing } from "../../style/spacing";

type OccurrenceFormProps = {
  initialData?: Ocorrencia | null;
  onAddItem: (item: Ocorrencia) => Promise<void> | void;
  onEditItem: (item: Ocorrencia) => Promise<void> | void;
  onDeleteItem: (id: string) => Promise<void> | void;
  onBack: () => void;
};

const ALL_CATEGORIES = [
  "Todos",
  "Buraco na via",
  "Iluminacao publica",
  "Lixo / Entulho",
  "Vazamento",
  "Alagamento",
];

const FORM_CATEGORIES = ALL_CATEGORIES.filter((category) => category !== "Todos");

const statusLabels: Record<ApiOccurrence["status"], string> = {
  IN_ANALYSIS: "EM ANALISE",
  RESOLVED: "RESOLVIDO",
  REJECTED: "REJEITADO",
};

function formatTimeAgo(date: string) {
  const createdAt = new Date(date).getTime();
  const diffInMinutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60000));

  if (diffInMinutes < 1) return "Agora mesmo";
  if (diffInMinutes < 60) return `${diffInMinutes} min`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d`;
}

function apiOccurrenceToCard(occurrence: ApiOccurrence): Ocorrencia {
  const hasLocation = occurrence.latitude !== null && occurrence.longitude !== null;
  const location = hasLocation
    ? {
        latitude: occurrence.latitude,
        longitude: occurrence.longitude,
        address: occurrence.address ?? undefined,
      }
    : occurrence.address ?? "Local marcado no mapa";

  return {
    id: String(occurrence.id),
    title: occurrence.title,
    description: occurrence.description ?? "",
    category: occurrence.category,
    anonymous: occurrence.anonymous,
    location,
    likes: occurrence.supportCount,
    comments: occurrence.commentsCount,
    timeAgo: formatTimeAgo(occurrence.createdAt),
    status: statusLabels[occurrence.status],
    photos: occurrence.photos,
    imageUrl: occurrence.photos.length > 0 ? { uri: occurrence.photos[0] } : undefined,
    supportedByMe: occurrence.supportedByMe,
    canEdit: occurrence.canEdit,
  };
}

async function photoToApiUri(uri: string) {
  if (uri.startsWith("data:") || uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri;
  }

  const base64 = await new File(uri).base64();

  return `data:image/jpeg;base64,${base64}`;
}

async function cardToPayload(item: Ocorrencia): Promise<OccurrencePayload> {
  const location = typeof item.location === "object" ? item.location : null;
  const photos = await Promise.all((item.photos ?? []).map(photoToApiUri));

  return {
    title: item.title.trim(),
    description: item.description?.trim(),
    category: item.category,
    anonymous: item.anonymous ?? false,
    latitude: location?.latitude,
    longitude: location?.longitude,
    address: location?.address ?? (typeof item.location === "string" ? item.location : undefined),
    photos,
  };
}

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
  const [saving, setSaving] = useState(false);

  function handlePhotoCapture(uri: string) {
    setPhotos((currentPhotos) => [...currentPhotos, uri]);
    setCameraOpen(false);
  }

  async function handleSave() {
    if (!title.trim()) {
      Toast.show({ type: "error", text1: "Informe um titulo" });
      return;
    }

    try {
      setSaving(true);

      if (isEditing && initialData) {
        await onEditItem({
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

      await onAddItem({
        id: "",
        title,
        description,
        category,
        anonymous: isAnonymous,
        location: location ?? "Avenida Ficticia, 123",
        likes: 0,
        comments: 0,
        timeAgo: "Agora mesmo",
        status: "EM ANALISE",
        photos,
        imageUrl: photos.length > 0 ? { uri: photos[0] } : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!initialData) {
      return;
    }

    Alert.alert(
      "Excluir ocorrencia",
      "Tem certeza que deseja apagar esta ocorrencia?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            void onDeleteItem(initialData.id);
          },
        },
      ],
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: globalStyles.container.backgroundColor }}>
      <Header title={isEditing ? "Editar ocorrencia" : "Nova ocorrencia"} showBack onBack={onBack} />

      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <AnonymousSwitch value={isAnonymous} onValueChange={setIsAnonymous} />

        <Input
          label="Titulo do problema"
          placeholder="Ex: Buraco no meio da rua"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Descricao detalhada"
          placeholder="Descreva o que esta acontecendo e como isso afeta a vizinhanca..."
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
          label="Evidencias (fotos)"
          onPress={() => setCameraOpen(true)}
          photos={photos}
        />

        <LocationPicker onLocationSelect={setLocation} initialLocation={location} />

        <Button
          title={saving ? "Salvando..." : isEditing ? "Salvar alteracoes" : "Publicar ocorrencia"}
          onPress={handleSave}
          style={{ marginTop: spacing.md, marginBottom: isEditing ? spacing.md : spacing.xxl }}
        />

        {isEditing ? (
          <Button
            title="Excluir ocorrencia"
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
  const [selectedItem, setSelectedItem] = useState<Ocorrencia | null>(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadOccurrences = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const data = await getOccurrences({
        search: searchText.trim() || undefined,
        category: activeCategory === ALL_CATEGORIES[0] ? undefined : activeCategory,
      });

      setListItems(data.map(apiOccurrenceToCard));
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erro ao carregar ocorrencias",
        text2: err?.friendlyMessage || err?.message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory, searchText]);

  React.useEffect(() => {
    void loadOccurrences();
  }, [loadOccurrences]);

  async function handleAddItem(newItem: Ocorrencia) {
    try {
      const created = await createOccurrence(await cardToPayload(newItem));
      setListItems((currentItems) => [apiOccurrenceToCard(created), ...currentItems]);
      setIsAdding(false);
      Toast.show({ type: "success", text1: "Sucesso", text2: "Sua ocorrencia foi publicada!" });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Nao foi possivel publicar",
        text2: err?.friendlyMessage || err?.message,
      });
    }
  }

  async function handleEditItem(updatedItem: Ocorrencia) {
    try {
      const updated = await updateOccurrence(Number(updatedItem.id), await cardToPayload(updatedItem));
      const updatedCard = apiOccurrenceToCard(updated);

      setListItems((currentItems) =>
        currentItems.map((item) => (item.id === updatedCard.id ? updatedCard : item)),
      );
      setEditingItem(null);
      Toast.show({ type: "success", text1: "Atualizada", text2: "A ocorrencia foi atualizada!" });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Nao foi possivel atualizar",
        text2: err?.friendlyMessage || err?.message,
      });
    }
  }

  async function handleDeleteItem(id: string) {
    try {
      await deleteOccurrence(Number(id));
      setListItems((currentItems) => currentItems.filter((item) => item.id !== id));
      setEditingItem(null);
      Toast.show({ type: "success", text1: "Excluida", text2: "A ocorrencia foi removida." });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Nao foi possivel excluir",
        text2: err?.friendlyMessage || err?.message,
      });
    }
  }

  async function handleToggleSupport(item: Ocorrencia) {
    try {
      const result = await toggleOccurrenceSupport(Number(item.id));
      const updatedCard = apiOccurrenceToCard(result.occurrence);

      setListItems((currentItems) =>
        currentItems.map((currentItem) => (currentItem.id === updatedCard.id ? updatedCard : currentItem)),
      );
      setSelectedItem((currentItem) => (currentItem?.id === updatedCard.id ? updatedCard : currentItem));
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Nao foi possivel apoiar",
        text2: err?.friendlyMessage || err?.message,
      });
    }
  }

  const handleCommentCountChange = useCallback((itemId: string, count: number) => {
    setListItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId && item.comments !== count ? { ...item, comments: count } : item,
      ),
    );
    setSelectedItem((currentItem) =>
      currentItem?.id === itemId && currentItem.comments !== count ? { ...currentItem, comments: count } : currentItem,
    );
  }, []);

  if (selectedItem) {
    return (
      <View style={{ flex: 1, backgroundColor: globalStyles.container.backgroundColor }}>
        <OccurrenceDetails
          occurrence={selectedItem}
          isSupported={selectedItem.supportedByMe}
          onBack={() => setSelectedItem(null)}
          onPressSupport={() => {
            void handleToggleSupport(selectedItem);
          }}
          onCommentCountChange={handleCommentCountChange}
        />
        <StatusBar style="auto" />
        <Toast position="top" bottomOffset={20} />
      </View>
    );
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
        <Toast position="top" bottomOffset={20} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: globalStyles.container.backgroundColor }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Resolve Ai" showNotification />

      <View style={{ padding: spacing.md, paddingBottom: 0 }}>
        <SearchBar
          placeholder="Buscar ocorrencias..."
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
          data={listItems}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 100, flexGrow: 1 }}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void loadOccurrences(false);
          }}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl }}>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={{ textAlign: "center" }}>Nenhuma ocorrencia encontrada.</Text>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <CardOcorrencia
              data={item}
              onPress={() => setSelectedItem(item)}
              onPressSupport={() => {
                void handleToggleSupport(item);
              }}
              onPressEdit={item.canEdit ? () => setEditingItem(item) : undefined}
              isSupported={item.supportedByMe}
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
