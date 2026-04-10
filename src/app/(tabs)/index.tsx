import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from 'react-native';
import "react-native-get-random-values";
import { CategorySelector } from '../../components/CategorySelector';
import { FAB } from '../../components/FAB';
import { Header } from '../../components/Header';
import { SearchBar } from '../../components/SearchBar';

import React, { useState } from "react";
import Toast from 'react-native-toast-message';
import { useFavorites } from '../../contexts/FavoritesContext';
import { globalStyles } from '../../style/global';
import { spacing } from '../../style/spacing';
import AddItem from "./add";
import ListItem from "./list";

export default function Index() {
  const [listItems, setListItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchText, setSearchText] = useState('');

  const { toggleSupport, isSupported } = useFavorites();

  const categories = ['Todos', 'Buraco na via', 'Iluminação pública', 'Lixo / Entulho', 'Vazamento', 'Alagamento'];

  const filteredItems = listItems.filter((item) => {
    const matchCategory =
      activeCategory === 'Todos' || item.category === activeCategory;

    const matchSearch =
      !searchText.trim() ||
      item.title.toLowerCase().includes(searchText.toLowerCase());

    return matchCategory && matchSearch;
  });

  const handleAddItem = (newItem: any) => {
    setListItems([newItem, ...listItems]);
    setIsAdding(false);
    Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Sua ocorrência foi publicada!' });
  };

  const handleEditItem = (updatedItem: any) => {
    setListItems(listItems.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditingItem(null);
    Toast.show({ type: 'success', text1: 'Atualizada', text2: 'A ocorrência foi atualizada!' });
  };

  const handleDeleteItem = (id: string) => {
    setListItems(listItems.filter(item => item.id !== id));
    setEditingItem(null);
    Toast.show({ type: 'success', text1: 'Excluída', text2: 'A ocorrência foi removida permanentemente.' });
  };

  const handleSupport = (item: any) => {
    toggleSupport(item);
  };

  if (isAdding || editingItem) {
    return (
      <View style={{ flex: 1, backgroundColor: globalStyles.container.backgroundColor }}>
        <AddItem
          initialData={editingItem}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onBack={() => { setIsAdding(false); setEditingItem(null); }}
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
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </View>

      <ListItem
        listItems={filteredItems}
        onLike={handleSupport}
        onEdit={(item: any) => setEditingItem(item)}
        isSupported={isSupported}
      />

      <FAB onPress={() => setIsAdding(true)} />

      <StatusBar style="auto" />
      <Toast position='top' bottomOffset={20} />
    </View>
  );
}
