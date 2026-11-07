import { apiClient, ApiError } from './apiClient';
import type { PaginatedResponse } from './pagination';

export const ACCOUNT_TYPES = ['ahorros', 'corriente', 'efectivo'] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export interface Account {
  id: number;
  user_id: number;
  nombre: string;
  saldo: string | number;
  tipo: string;
  creada?: string | null;
  actualizada?: string | null;
}

export interface AccountPayload {
  name: string;
  type: AccountType;
  balance: number;
}

export interface AccountFormValues {
  name: string;
  type: AccountType;
  balance: string;
}

export type AccountFormErrors = Record<string, string>;

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  ahorros: 'Ahorros',
  corriente: 'Corriente',
  efectivo: 'Efectivo',
};

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 50;
const MAX_BALANCE = 999999999999.99;

export function isAccountType(value: string): value is AccountType {
  return (ACCOUNT_TYPES as readonly string[]).includes(value);
}

export function accountTypeLabel(type: string): string {
  return isAccountType(type) ? ACCOUNT_TYPE_LABELS[type] : type;
}

export function emptyAccountForm(): AccountFormValues {
  return {
    name: '',
    type: 'ahorros',
    balance: '0',
  };
}

export function accountToFormValues(account: Account): AccountFormValues {
  return {
    name: account.nombre,
    type: isAccountType(account.tipo) ? account.tipo : 'ahorros',
    balance: String(account.saldo),
  };
}

export function buildAccountPayload(values: AccountFormValues): AccountPayload {
  return {
    name: values.name.trim(),
    type: values.type,
    balance: Number(values.balance),
  };
}

export function validateAccountForm(values: AccountFormValues): AccountFormErrors {
  const errors: AccountFormErrors = {};
  const name = values.name.trim();

  if (!name) {
    errors.name = 'El nombre de la cuenta es obligatorio.';
  } else if (name.length < NAME_MIN_LENGTH) {
    errors.name = `El nombre de la cuenta debe tener al menos ${NAME_MIN_LENGTH} caracteres.`;
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `El nombre de la cuenta no puede superar los ${NAME_MAX_LENGTH} caracteres.`;
  }

  if (!isAccountType(values.type)) {
    errors.type = 'Selecciona un tipo de cuenta válido.';
  }

  if (!values.balance.trim()) {
    errors.balance = 'El saldo es obligatorio.';
  } else {
    const balance = Number(values.balance);

    if (!Number.isFinite(balance)) {
      errors.balance = 'El saldo debe ser un número válido.';
    } else if (balance < 0) {
      errors.balance = 'El saldo no puede ser negativo.';
    } else if (balance > MAX_BALANCE) {
      errors.balance = 'El saldo supera el máximo permitido.';
    }
  }

  return errors;
}

export function toAccountFieldErrors(error: ApiError): AccountFormErrors {
  return Object.fromEntries(
    Object.entries(error.errors)
      .map(([field, messages]) => [field, messages[0] ?? ''])
      .filter(([, message]) => message !== ''),
  );
}

export function getAccountErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

export function fetchAccountsPage(page = 1, perPage = 20): Promise<PaginatedResponse<Account>> {
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  return apiClient.get<PaginatedResponse<Account>>(`/accounts?${query.toString()}`);
}

export async function fetchAccount(id: number): Promise<Account> {
  const response = await apiClient.get<{ data: Account }>(`/accounts/${id}`);

  return response.data;
}

export async function createAccount(payload: AccountPayload): Promise<Account> {
  const response = await apiClient.post<{ data: Account }>('/accounts', payload);

  return response.data;
}

export async function updateAccount(id: number, payload: AccountPayload): Promise<Account> {
  const response = await apiClient.patch<{ data: Account }>(`/accounts/${id}`, payload);

  return response.data;
}
