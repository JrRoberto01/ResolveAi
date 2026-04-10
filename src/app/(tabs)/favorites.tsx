import React, { useState } from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { CategorySelector } from '../../components/CategorySelector';
import { FavoriteCard } from '../../components/FavoriteCard';
import { Header } from '../../components/Header';
import { SearchBar } from '../../components/SearchBar';
import { useFavorites } from '../../contexts/FavoritesContext';
import { colors } from '../../style/colors';
import { spacing } from '../../style/spacing';

export default function Favorites() {
  const { favorites } = useFavorites();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchText, setSearchText] = useState('');

  const categories = ['Todos', 'Em análise', 'Resolvidos'];

  const filteredFavorites = favorites.filter((item) => {
    const matchCategory =
      activeCategory === 'Todos' ||
      (activeCategory === 'Em análise' && item.status?.toUpperCase() === 'EM ANÁLISE') ||
      (activeCategory === 'Resolvidos' && item.status?.toUpperCase() === 'RESOLVIDO');

    const matchSearch =
      !searchText.trim() ||
      item.title.toLowerCase().includes(searchText.toLowerCase());

    return matchCategory && matchSearch;
  });

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
          <FavoriteCard data={item} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhum favorito encontrado.
            </Text>
            <Text style={styles.emptySubtext}>
              Apoie ocorrências no feed para vê-las aqui!
            </Text>
          </View>
        }
      />
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