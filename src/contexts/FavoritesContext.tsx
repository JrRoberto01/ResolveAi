import React, { createContext, useContext, useState, useCallback } from 'react';
import { Ocorrencia } from '../components/CardOcorrencia';

interface FavoritesContextData {
  favorites: Ocorrencia[];
  toggleSupport: (item: Ocorrencia) => void;
  isSupported: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Ocorrencia[]>([]);

  const toggleSupport = useCallback((item: Ocorrencia) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.id === item.id);
      if (exists) {
        return prev.filter((f) => f.id !== item.id);
      }
      return [{ ...item, likes: 1 }, ...prev];
    });
  }, []);

  const isSupported = useCallback(
    (id: string) => {
      return favorites.some((f) => f.id === id);
    },
    [favorites]
  );

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
