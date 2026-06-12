import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import {
  getSupportedOccurrences,
  toggleOccurrenceSupport,
} from '../../api/occurrences.api';
import type { ApiOccurrence } from '../../api/occurrences.api';
import { CategorySelector } from '../../components/CategorySelector';
import { FavoriteCard } from '../../components/FavoriteCard';
import { Header } from '../../components/Header';
import { OccurrenceDetails } from '../../components/OccurrenceDetails';
import { SearchBar } from '../../components/SearchBar';
import { Ocorrencia } from '../../components/CardOcorrencia';
import { colors } from '../../style/colors';
import { spacing } from '../../style/spacing';
import Toast from 'react-native-toast-message';

const categories = ['Todos', 'Em analise', 'Resolvidos'];

const statusLabels: Record<ApiOccurrence['status'], string> = {
  IN_ANALYSIS: 'EM ANALISE',
  RESOLVED: 'RESOLVIDO',
  REJECTED: 'REJEITADO',
};

function formatTimeAgo(date: string) {
  const createdAt = new Date(date).getTime();
  const diffInMinutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60000));

  if (diffInMinutes < 1) return 'Agora mesmo';
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
    : occurrence.address ?? 'Local marcado no mapa';

  return {
    id: String(occurrence.id),
    title: occurrence.title,
    description: occurrence.description ?? '',
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

export default function Favorites() {
  const [favorites, setFavorites] = useState<Ocorrencia[]>([]);
  const [selectedItem, setSelectedItem] = useState<Ocorrencia | null>(null);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSupportedOccurrences();
      setFavorites(data.map(apiOccurrenceToCard));
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadFavorites();
    }, [loadFavorites]),
  );

  const filteredFavorites = favorites.filter((item) => {
    const matchCategory =
      activeCategory === categories[0] ||
      (activeCategory === categories[1] && item.status?.toUpperCase() === 'EM ANALISE') ||
      (activeCategory === categories[2] && item.status?.toUpperCase() === 'RESOLVIDO');

    const matchSearch =
      !searchText.trim() ||
      item.title.toLowerCase().includes(searchText.toLowerCase());

    return matchCategory && matchSearch;
  });

  async function handleToggleSupport(item: Ocorrencia) {
    try {
      const result = await toggleOccurrenceSupport(Number(item.id));
      const updatedCard = apiOccurrenceToCard(result.occurrence);

      if (result.supported) {
        setFavorites((currentItems) =>
          currentItems.map((currentItem) => (currentItem.id === updatedCard.id ? updatedCard : currentItem)),
        );
        setSelectedItem((currentItem) => (currentItem?.id === updatedCard.id ? updatedCard : currentItem));
        return;
      }

      setFavorites((currentItems) => currentItems.filter((currentItem) => currentItem.id !== item.id));
      setSelectedItem((currentItem) =>
        currentItem?.id === item.id ? { ...currentItem, supportedByMe: false, likes: updatedCard.likes } : currentItem,
      );
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Nao foi possivel apoiar',
        text2: err?.friendlyMessage || err?.message,
      });
    }
  }

  const handleCommentCountChange = useCallback((itemId: string, count: number) => {
    setFavorites((currentItems) =>
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
      <View style={styles.container}>
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

  return (
    <View style={styles.container}>
      <Header title="Favoritos" showBack showNotification />

      <View style={styles.filtersContainer}>
        <SearchBar
          placeholder="Pesquisar nos favoritos..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <CategorySelector
          horizontal
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </View>

      <FlatList
        data={filteredFavorites}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <FavoriteCard data={item} onPressDetails={() => setSelectedItem(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <>
                <Text style={styles.emptyText}>
                  Nenhum favorito encontrado.
                </Text>
                <Text style={styles.emptySubtext}>
                  Apoie ocorrencias no feed para ve-las aqui.
                </Text>
              </>
            )}
          </View>
        }
      />
      <Toast position="top" bottomOffset={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtersContainer: {
    padding: spacing.md,
    paddingBottom: 0,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
