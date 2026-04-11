import React, { createContext, useContext, useState } from 'react';
import { Ocorrencia } from '../components/CardOcorrencia';

interface FavoritesContextData {
  favorites: Ocorrencia[];
  toggleSupport: (item: Ocorrencia) => void;
  isSupported: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextData | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Ocorrencia[]>([]);

  function toggleSupport(item: Ocorrencia) {
    setFavorites((currentFavorites) => {
      const exists = currentFavorites.find((favorite) => favorite.id === item.id);

      if (exists) {
        return currentFavorites.filter((favorite) => favorite.id !== item.id);
      }

      return [{ ...item, likes: 1 }, ...currentFavorites];
    });
  }

  function isSupported(id: string) {
    return favorites.some((favorite) => favorite.id === id);
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleSupport, isSupported }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }

  return context;
}
