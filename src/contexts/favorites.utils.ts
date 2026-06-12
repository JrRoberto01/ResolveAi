import { Ocorrencia } from '../components/CardOcorrencia';

export function toggleFavoriteSupport(currentFavorites: Ocorrencia[], item: Ocorrencia) {
  const exists = currentFavorites.some((favorite) => favorite.id === item.id);

  if (exists) {
    return currentFavorites.filter((favorite) => favorite.id !== item.id);
  }

  return [{ ...item, likes: 1 }, ...currentFavorites];
}

export function isFavoriteSupported(favorites: Ocorrencia[], id: string) {
  return favorites.some((favorite) => favorite.id === id);
}
