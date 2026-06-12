import React, { createContext, useContext, useState } from 'react';
import { Ocorrencia } from '../components/CardOcorrencia';
import { isFavoriteSupported, toggleFavoriteSupport } from './favorites.utils';

interface FavoritesContextData {
  favorites: Ocorrencia[];
  toggleSupport: (item: Ocorrencia) => void;
  isSupported: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextData | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Ocorrencia[]>([]);

  function toggleSupport(item: Ocorrencia) {
    setFavorites((currentFavorites) => toggleFavoriteSupport(currentFavorites, item));
  }

  function isSupported(id: string) {
    return isFavoriteSupported(favorites, id);
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
