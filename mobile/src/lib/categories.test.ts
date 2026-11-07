import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as ApiClientModule from './apiClient';
import { apiClient } from './apiClient';
import { categoryLabel, fetchAllCategories, fetchCategoriesPage, type Category } from './categories';
import type { PaginatedResponse } from './pagination';

vi.mock('./apiClient', async () => {
  const actual = await vi.importActual<typeof ApiClientModule>('./apiClient');

  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    },
  };
});

const getRequest = vi.mocked(apiClient.get);

const categories: Category[] = [
  { id: 3, user_id: 1, nombre: 'Comida', tipo: 'gasto' },
  { id: 4, user_id: 1, nombre: 'Salario', tipo: 'ingreso' },
];

function page(data: Category[], currentPage = 1, lastPage = 1): PaginatedResponse<Category> {
  return {
    data,
    meta: {
      current_page: currentPage,
      last_page: lastPage,
      per_page: 50,
      total: data.length,
      from: 1,
      to: data.length,
    },
    links: {
      first: null,
      last: null,
      prev: null,
      next: null,
    },
  };
}

describe('categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista las categorías con paginación', async () => {
    const response = page(categories);
    getRequest.mockResolvedValue(response);

    await expect(fetchCategoriesPage(2)).resolves.toEqual(response);
    expect(getRequest).toHaveBeenCalledWith('/categories?page=2&per_page=50');
  });

  it('recorre todas las páginas de categorías', async () => {
    getRequest.mockResolvedValueOnce(page([categories[0]], 1, 2)).mockResolvedValueOnce(page([categories[1]], 2, 2));

    await expect(fetchAllCategories()).resolves.toEqual(categories);
    expect(getRequest).toHaveBeenCalledTimes(2);
    expect(getRequest).toHaveBeenNthCalledWith(2, '/categories?page=2&per_page=50');
  });

  it('etiqueta las categorías según su tipo', () => {
    expect(categoryLabel(categories[0])).toBe('Comida (Gasto)');
    expect(categoryLabel(categories[1])).toBe('Salario (Ingreso)');
    expect(categoryLabel({ ...categories[0], tipo: 'otro' })).toBe('Comida');
  });
});
