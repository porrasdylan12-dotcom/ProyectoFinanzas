import { apiClient } from './apiClient';
import type { PaginatedResponse } from './pagination';

const CATEGORY_PAGE_SIZE = 50;

export interface Category {
  id: number;
  user_id: number;
  nombre: string;
  tipo: string;
  creada?: string | null;
  actualizada?: string | null;
}

export function fetchCategoriesPage(page = 1, perPage = CATEGORY_PAGE_SIZE): Promise<PaginatedResponse<Category>> {
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  return apiClient.get<PaginatedResponse<Category>>(`/categories?${query.toString()}`);
}

export async function fetchAllCategories(): Promise<Category[]> {
  const firstPage = await fetchCategoriesPage();
  const categories = [...firstPage.data];

  for (let page = firstPage.meta.current_page + 1; page <= firstPage.meta.last_page; page += 1) {
    const nextPage = await fetchCategoriesPage(page);
    categories.push(...nextPage.data);
  }

  return categories;
}

export function categoryLabel(category: Category): string {
  if (category.tipo === 'ingreso') {
    return `${category.nombre} (Ingreso)`;
  }

  if (category.tipo === 'gasto') {
    return `${category.nombre} (Gasto)`;
  }

  return category.nombre;
}
