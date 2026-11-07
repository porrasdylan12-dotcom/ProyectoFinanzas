import { apiClient, ApiError } from './apiClient';
import type { PaginatedResponse } from './pagination';

export interface Budget {
  id: number;
  user_id: number;
  categoria_id: number;
  nombre: string;
  monto_maximo: string | number;
  mes: number;
  año: number;
  creada?: string | null;
  actualizada?: string | null;
}

export interface BudgetPayload {
  category_id: number;
  name: string;
  maxAmount: number;
  month: number;
  year: number;
}

export interface BudgetFormValues {
  name: string;
  categoryId: string;
  maxAmount: string;
  month: string;
  year: string;
}

export type BudgetFormErrors = Record<string, string>;

export const BUDGET_MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
] as const;

const BUDGET_FIELD_MAP: Record<string, keyof BudgetFormValues> = {
  category_id: 'categoryId',
  name: 'name',
  maxAmount: 'maxAmount',
  month: 'month',
  year: 'year',
};

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 100;
const MAX_AMOUNT = 999999999999.99;
const MIN_YEAR = 2020;
const MAX_YEAR = 2100;

export function monthLabel(month: number): string {
  return BUDGET_MONTHS.find((option) => option.value === month)?.label ?? String(month);
}

export function emptyBudgetForm(now = new Date()): BudgetFormValues {
  return {
    name: '',
    categoryId: '',
    maxAmount: '',
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
  };
}

export function buildBudgetPayload(values: BudgetFormValues): BudgetPayload {
  return {
    category_id: Number(values.categoryId),
    name: values.name.trim(),
    maxAmount: Number(values.maxAmount),
    month: Number(values.month),
    year: Number(values.year),
  };
}

export function validateBudgetForm(values: BudgetFormValues, now = new Date()): BudgetFormErrors {
  const errors: BudgetFormErrors = {};
  const name = values.name.trim();
  const categoryId = Number(values.categoryId);
  const month = Number(values.month);
  const year = Number(values.year);

  if (!name) {
    errors.name = 'El nombre del presupuesto es obligatorio.';
  } else if (name.length < NAME_MIN_LENGTH) {
    errors.name = `El nombre del presupuesto debe tener al menos ${NAME_MIN_LENGTH} caracteres.`;
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `El nombre del presupuesto no puede superar los ${NAME_MAX_LENGTH} caracteres.`;
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    errors.categoryId = 'La categoría es obligatoria.';
  }

  if (!values.maxAmount.trim()) {
    errors.maxAmount = 'El monto máximo del presupuesto es obligatorio.';
  } else {
    const maxAmount = Number(values.maxAmount);

    if (!Number.isFinite(maxAmount)) {
      errors.maxAmount = 'El monto máximo debe ser un número válido.';
    } else if (maxAmount < 0.01) {
      errors.maxAmount = 'El monto máximo debe ser al menos 0.01.';
    } else if (maxAmount > MAX_AMOUNT) {
      errors.maxAmount = 'El monto máximo supera el máximo permitido.';
    }
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    errors.month = 'El mes debe estar entre 1 y 12.';
  }

  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    errors.year = `El año debe estar entre ${MIN_YEAR} y ${MAX_YEAR}.`;
  }

  if (!errors.month && !errors.year) {
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errors.month = 'No se puede crear un presupuesto para un período que ya pasó.';
    }
  }

  return errors;
}

export function toBudgetFieldErrors(error: ApiError): BudgetFormErrors {
  const errors: BudgetFormErrors = {};

  for (const [field, messages] of Object.entries(error.errors)) {
    const mappedField = BUDGET_FIELD_MAP[field];
    const message = messages[0];

    if (mappedField && message) {
      errors[mappedField] = message;
    }
  }

  return errors;
}

export function getBudgetErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

export function fetchBudgetsPage(page = 1, perPage = 50): Promise<PaginatedResponse<Budget>> {
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  return apiClient.get<PaginatedResponse<Budget>>(`/budgets?${query.toString()}`);
}

export async function createBudget(payload: BudgetPayload): Promise<Budget> {
  const response = await apiClient.post<{ data: Budget }>('/budgets', payload);

  return response.data;
}
