import "react-native-get-random-values";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { View } from 'react-native';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { CategorySelector } from '../components/CategorySelector';
import { FAB } from '../components/FAB';
import { BottomMenu } from '../components/BottomMenu';
import AddItem from "./add";
import ListItem from "./list";
import React, { useState } from "react";
import Toast from 'react-native-toast-message';
import { globalStyles } from '../theme/globalStyles';
import { spacing } from '../theme/spacing';

export default function Index() {
  const [listItems, setListItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [editingItem, setEditingItem] = useState<any>(null);

  const categories = ['Todos', 'Buracos', 'Iluminação', 'Lixo', 'Alagamento'];

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

  const handleLike = (id: string) => {
    setListItems(listItems.map(item => 
      item.id === id ? { ...item, likes: item.likes + 1 } : item
    ));
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
        <SearchBar />
        <CategorySelector 
          horizontal 
          categories={categories} 
          activeCategory={activeCategory} 
          onSelect={setActiveCategory} 
        />
      </View>

      <ListItem 
        listItems={listItems} 
        onLike={handleLike} 
        onEdit={(item: any) => setEditingItem(item)} 
      />
      
      <FAB onPress={() => setIsAdding(true)} />
      <BottomMenu />
      <StatusBar style="auto" />
      <Toast position='top' bottomOffset={20}/>
    </View>
  );
}
