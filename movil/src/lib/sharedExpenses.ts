import { apiClient, ApiError } from './apiClient';
import type { GroupDebt } from './groupDebts';
import type { PaginatedResponse } from './pagination';

export interface SharedExpense {
  id: number;
  grupo_id: number;
  usuario_id: number;
  monto: string | number;
  descripcion: string | null;
  fecha: string;
  participantes: number[] | null;
  deudas?: GroupDebt[];
  creada?: string | null;
  actualizada?: string | null;
}

export interface SharedExpensePayload {
  amount: number;
  description: string | null;
  date: string;
  participants: number[];
}

export interface SharedExpenseFormValues {
  amount: string;
  description: string;
  date: string;
  participantIds: number[];
}

export type SharedExpenseFormErrors = Record<string, string>;

const MAX_AMOUNT = 999999999999.99;
const DESCRIPTION_MAX_LENGTH = 1000;
const FIELD_MAP: Record<string, keyof SharedExpenseFormValues> = {
  amount: 'amount',
  description: 'description',
  date: 'date',
  participants: 'participantIds',
};

export function todaySharedExpenseDate(now = new Date()): string {
  return toIsoDate(now);
}

export function emptySharedExpenseForm(memberIds: number[], date = todaySharedExpenseDate()): SharedExpenseFormValues {
  return {
    amount: '',
    description: '',
    date,
    participantIds: [...memberIds],
  };
}

export function buildSharedExpensePayload(values: SharedExpenseFormValues): SharedExpensePayload {
  return {
    amount: Number(values.amount),
    description: values.description.trim() || null,
    date: values.date,
    participants: values.participantIds,
  };
}

export function validateSharedExpenseForm(values: SharedExpenseFormValues): SharedExpenseFormErrors {
  const errors: SharedExpenseFormErrors = {};

  if (!values.amount.trim()) {
    errors.amount = 'El monto del gasto compartido es obligatorio.';
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
    errors.date = 'La fecha del gasto compartido es obligatoria.';
  } else if (!isValidIsoDate(values.date)) {
    errors.date = 'La fecha debe ser una fecha válida.';
  }

  if (values.description.trim().length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `La descripción no puede superar los ${DESCRIPTION_MAX_LENGTH} caracteres.`;
  }

  if (values.participantIds.length < 2) {
    errors.participantIds = 'Debes seleccionar al menos 2 participantes.';
  }

  return errors;
}

export function toSharedExpenseFieldErrors(error: ApiError): SharedExpenseFormErrors {
  const errors: SharedExpenseFormErrors = {};

  for (const [field, messages] of Object.entries(error.errors)) {
    const mappedField = field.startsWith('participants') ? 'participantIds' : FIELD_MAP[field];
    const message = messages[0];

    if (mappedField && message) {
      errors[mappedField] = message;
    }
  }

  return errors;
}

export function getSharedExpenseErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

export function formatSharedExpenseDate(value: string): string {
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

export function fetchSharedExpensesPage(
  groupId: number,
  page = 1,
  perPage = 20,
): Promise<PaginatedResponse<SharedExpense>> {
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    sort_by: 'date',
    sort_dir: 'desc',
  });

  return apiClient.get<PaginatedResponse<SharedExpense>>(`/groups/${groupId}/shared-expenses?${query.toString()}`);
}

export async function fetchSharedExpense(id: number): Promise<SharedExpense> {
  const response = await apiClient.get<{ data: SharedExpense }>(`/shared-expenses/${id}`);

  return response.data;
}

export async function createSharedExpense(groupId: number, payload: SharedExpensePayload): Promise<SharedExpense> {
  const response = await apiClient.post<{ data: SharedExpense }>(`/groups/${groupId}/shared-expenses`, payload);

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
