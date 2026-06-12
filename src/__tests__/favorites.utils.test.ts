import { Ocorrencia } from '../components/CardOcorrencia';
import { isFavoriteSupported, toggleFavoriteSupport } from '../contexts/favorites.utils';

const occurrence: Ocorrencia = {
  id: '1',
  title: 'Buraco na rua',
  description: 'Buraco grande próximo à praça',
  category: 'Infraestrutura',
  location: 'Rua Central',
  likes: 8,
  comments: 2,
  timeAgo: 'agora',
};

describe('favorites business rules', () => {
  it('adds a supported occurrence to the beginning and normalizes likes to 1', () => {
    const previous: Ocorrencia[] = [{ ...occurrence, id: '2', title: 'Iluminação', likes: 4 }];

    const result = toggleFavoriteSupport(previous, occurrence);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: '1', likes: 1 });
    expect(result[1].id).toBe('2');
  });

  it('removes an occurrence when it is already supported', () => {
    const result = toggleFavoriteSupport([occurrence], occurrence);

    expect(result).toEqual([]);
  });

  it('checks whether an occurrence is supported by id', () => {
    expect(isFavoriteSupported([occurrence], '1')).toBe(true);
    expect(isFavoriteSupported([occurrence], 'missing')).toBe(false);
  });
});
