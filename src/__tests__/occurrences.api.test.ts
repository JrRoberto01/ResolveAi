import { api } from '../api/client';
import {
  createOccurrence,
  createOccurrenceComment,
  deleteOccurrence,
  deleteOccurrenceComment,
  getOccurrenceComments,
  getOccurrences,
  getSupportedOccurrences,
  toggleOccurrenceSupport,
  updateOccurrence,
  updateOccurrenceComment,
} from '../api/occurrences.api';

jest.mock('../api/client', () => ({
  api: {
    delete: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedApi = jest.mocked(api);

describe('occurrences api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches occurrences with filters', async () => {
    const data = [{ id: 1, title: 'Teste' }];
    mockedApi.get.mockResolvedValueOnce({ data });

    await expect(getOccurrences({ search: 'rua', category: 'Infraestrutura' })).resolves.toBe(data);

    expect(mockedApi.get).toHaveBeenCalledWith('/occurrences', {
      params: { search: 'rua', category: 'Infraestrutura' },
    });
  });

  it('fetches supported occurrences', async () => {
    const data = [{ id: 1 }];
    mockedApi.get.mockResolvedValueOnce({ data });

    await expect(getSupportedOccurrences()).resolves.toBe(data);
    expect(mockedApi.get).toHaveBeenCalledWith('/occurrences/supported/me');
  });

  it('creates, updates, deletes and toggles support for occurrences', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { id: 1 } });
    await expect(createOccurrence({ title: 'Nova', category: 'Limpeza' })).resolves.toEqual({ id: 1 });
    expect(mockedApi.post).toHaveBeenCalledWith('/occurrences', { title: 'Nova', category: 'Limpeza' });

    mockedApi.patch.mockResolvedValueOnce({ data: { id: 1, title: 'Editada' } });
    await expect(updateOccurrence(1, { title: 'Editada' })).resolves.toEqual({ id: 1, title: 'Editada' });
    expect(mockedApi.patch).toHaveBeenCalledWith('/occurrences/1', { title: 'Editada' });

    mockedApi.delete.mockResolvedValueOnce({ data: { message: 'ok' } });
    await expect(deleteOccurrence(1)).resolves.toEqual({ message: 'ok' });
    expect(mockedApi.delete).toHaveBeenCalledWith('/occurrences/1');

    mockedApi.post.mockResolvedValueOnce({ data: { supported: true, occurrence: { id: 1 } } });
    await expect(toggleOccurrenceSupport(1)).resolves.toEqual({ supported: true, occurrence: { id: 1 } });
    expect(mockedApi.post).toHaveBeenCalledWith('/occurrences/1/support');
  });

  it('handles occurrence comments endpoints', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 10, content: 'Comentário' }] });
    await expect(getOccurrenceComments(1)).resolves.toEqual([{ id: 10, content: 'Comentário' }]);
    expect(mockedApi.get).toHaveBeenCalledWith('/occurrences/1/comments');

    mockedApi.post.mockResolvedValueOnce({ data: { id: 11, content: 'Novo' } });
    await expect(createOccurrenceComment(1, 'Novo')).resolves.toEqual({ id: 11, content: 'Novo' });
    expect(mockedApi.post).toHaveBeenCalledWith('/occurrences/1/comments', { content: 'Novo' });

    mockedApi.patch.mockResolvedValueOnce({ data: { id: 11, content: 'Editado' } });
    await expect(updateOccurrenceComment(1, 11, 'Editado')).resolves.toEqual({ id: 11, content: 'Editado' });
    expect(mockedApi.patch).toHaveBeenCalledWith('/occurrences/1/comments/11', { content: 'Editado' });

    mockedApi.delete.mockResolvedValueOnce({ data: { message: 'removido' } });
    await expect(deleteOccurrenceComment(1, 11)).resolves.toEqual({ message: 'removido' });
    expect(mockedApi.delete).toHaveBeenCalledWith('/occurrences/1/comments/11');
  });
});
