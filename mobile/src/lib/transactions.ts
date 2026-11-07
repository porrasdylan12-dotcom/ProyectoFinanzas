import { apiClient, ApiError } from './apiClient';
import type { PaginatedResponse } from './pagination';

export const TRANSACTION_TYPES = ['ingreso', 'gasto'] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export interface Transaction {
  id: number;
  cuenta_id: number;
  categoria_id: number;
  tipo: string;
  monto: string | number;
  descripcion: string | null;
  fecha: string;
  creada?: string | null;
  actualizada?: string | null;
}

export interface TransactionPayload {
  account_id: number;
  category_id: number;
  type: TransactionType;
  amount: number;
  description: string | null;
  transaction_date: string;
}

export interface TransactionFormValues {
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: string;
  description: string;
  date: string;
}

export type TransactionFormErrors = Record<string, string>;

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  ingreso: 'Ingreso',
  gasto: 'Gasto',
};

const TRANSACTION_FIELD_MAP: Record<string, keyof TransactionFormValues> = {
  account_id: 'accountId',
  category_id: 'categoryId',
  type: 'type',
  amount: 'amount',
  description: 'description',
  transaction_date: 'date',
};

const MAX_AMOUNT = 999999999999.99;
const DESCRIPTION_MAX_LENGTH = 1000;

export function isTransactionType(value: string): value is TransactionType {
  return (TRANSACTION_TYPES as readonly string[]).includes(value);
}

export function transactionTypeLabel(type: string): string {
  return isTransactionType(type) ? TRANSACTION_TYPE_LABELS[type] : type;
}

export function todayIsoDate(now = new Date()): string {
  return toIsoDate(now);
}

export function emptyTransactionForm(accountId: number, date = todayIsoDate()): TransactionFormValues {
  return {
    accountId: String(accountId),
    categoryId: '',
    type: 'gasto',
    amount: '',
    description: '',
    date,
  };
}

export function buildTransactionPayload(values: TransactionFormValues): TransactionPayload {
  return {
    account_id: Number(values.accountId),
    category_id: Number(values.categoryId),
    type: values.type,
    amount: Number(values.amount),
    description: values.description.trim() || null,
    transaction_date: values.date,
  };
}

export function validateTransactionForm(values: TransactionFormValues): TransactionFormErrors {
  const errors: TransactionFormErrors = {};
  const accountId = Number(values.accountId);
  const categoryId = Number(values.categoryId);

  if (!Number.isInteger(accountId) || accountId <= 0) {
    errors.accountId = 'La cuenta de la transacción no es válida.';
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    errors.categoryId = 'La categoría es obligatoria.';
  }

  if (!isTransactionType(values.type)) {
    errors.type = 'Selecciona un tipo de transacción válido.';
  }

  if (!values.amount.trim()) {
    errors.amount = 'El monto de la transacción es obligatorio.';
  } else {
    const amount = Number(values.amount);

    if (!Number.isFinite(amount)) {
      errors.amount = 'El monto debe ser un número válido.';
    } else if (amount < 0.01) {
      errors.amount = 'El monto debe ser al menos 0.01.';
    } else if (amount > MAX_AMOUNT) {
      errors.amount = 'El monto supera el máximo permitido.';
    }
  }

  if (!values.date.trim()) {
    errors.date = 'La fecha de la transacción es obligatoria.';
  } else if (!isValidIsoDate(values.date)) {
    errors.date = 'La fecha debe ser una fecha válida.';
  }

  if (values.description.trim().length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `La descripción no puede superar los ${DESCRIPTION_MAX_LENGTH} caracteres.`;
  }

  return errors;
}

export function toTransactionFieldErrors(error: ApiError): TransactionFormErrors {
  const errors: TransactionFormErrors = {};

  for (const [field, messages] of Object.entries(error.errors)) {
    const mappedField = TRANSACTION_FIELD_MAP[field];
    const message = messages[0];

    if (mappedField && message) {
      errors[mappedField] = message;
    }
  }

  return errors;
}

export function getTransactionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

export function formatTransactionDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

export function fetchTransactionsPage(
  accountId: number | null,
  page = 1,
  perPage = 20,
): Promise<PaginatedResponse<Transaction>> {
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    sort_by: 'transaction_date',
    sort_dir: 'desc',
  });

  if (accountId !== null) {
    query.set('account_id', String(accountId));
  }

  return apiClient.get<PaginatedResponse<Transaction>>(`/transactions?${query.toString()}`);
}

export async function fetchTransaction(id: number): Promise<Transaction> {
  const response = await apiClient.get<{ data: Transaction }>(`/transactions/${id}`);

  return response.data;
}

export async function createTransaction(payload: TransactionPayload): Promise<Transaction> {
  const response = await apiClient.post<{ data: Transaction }>('/transactions', payload);

  return response.data;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);

  return toIsoDate(parsed) === value;
}
