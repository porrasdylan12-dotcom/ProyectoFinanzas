import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  accountToFormValues,
  buildAccountPayload,
  createAccount,
  fetchAccount,
  fetchAccountsPage,
  getAccountErrorMessage,
  toAccountFieldErrors,
  updateAccount,
  validateAccountForm,
  type Account,
  type AccountFormValues,
} from './accounts';
import type * as ApiClientModule from './apiClient';
import { apiClient, ApiError } from './apiClient';
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
const postRequest = vi.mocked(apiClient.post);
const patchRequest = vi.mocked(apiClient.patch);

const account: Account = {
  id: 7,
  user_id: 1,
  nombre: 'Ahorros',
  saldo: '1500.50',
  tipo: 'ahorros',
};

function page(data: Account[]): PaginatedResponse<Account> {
  return {
    data,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: data.length,
      from: data.length > 0 ? 1 : null,
      to: data.length > 0 ? data.length : null,
    },
    links: {
      first: null,
      last: null,
      prev: null,
      next: null,
    },
  };
}

describe('accounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista las cuentas con paginación', async () => {
    const response = page([account]);
    getRequest.mockResolvedValue(response);

    await expect(fetchAccountsPage(2, 10)).resolves.toEqual(response);
    expect(getRequest).toHaveBeenCalledWith('/accounts?page=2&per_page=10');
  });

  it('obtiene el detalle de una cuenta', async () => {
    getRequest.mockResolvedValue({ data: account });

    await expect(fetchAccount(7)).resolves.toEqual(account);
    expect(getRequest).toHaveBeenCalledWith('/accounts/7');
  });

  it('crea y actualiza una cuenta con el payload del backend', async () => {
    postRequest.mockResolvedValue({ data: account });
    patchRequest.mockResolvedValue({ data: { ...account, nombre: 'Ahorros editada' } });

    await expect(createAccount({ name: 'Ahorros', type: 'ahorros', balance: 1500.5 })).resolves.toEqual(account);
    expect(postRequest).toHaveBeenCalledWith('/accounts', {
      name: 'Ahorros',
      type: 'ahorros',
      balance: 1500.5,
    });

    await expect(updateAccount(7, { name: 'Ahorros editada', type: 'corriente', balance: 10 })).resolves.toEqual({
      ...account,
      nombre: 'Ahorros editada',
    });
    expect(patchRequest).toHaveBeenCalledWith('/accounts/7', {
      name: 'Ahorros editada',
      type: 'corriente',
      balance: 10,
    });
  });

  it('convierte una cuenta al formulario y construye el payload normalizado', () => {
    const values = accountToFormValues(account);

    expect(values).toEqual({ name: 'Ahorros', type: 'ahorros', balance: '1500.50' });
    expect(buildAccountPayload({ ...values, name: '  Viajes  ', balance: '99.90' })).toEqual({
      name: 'Viajes',
      type: 'ahorros',
      balance: 99.9,
    });
  });

  it('valida nombre, tipo y saldo del formulario', () => {
    const invalid: AccountFormValues = { name: ' A ', type: 'ahorros', balance: '' };
    const invalidType = { ...invalid, type: 'desconocido' } as unknown as AccountFormValues;
    const negative = { ...invalid, name: 'Cuenta', balance: '-1' };
    const nonNumeric = { ...invalid, name: 'Cuenta', balance: 'abc' };

    expect(validateAccountForm(invalid)).toEqual({
      name: 'El nombre de la cuenta debe tener al menos 3 caracteres.',
      balance: 'El saldo es obligatorio.',
    });
    expect(validateAccountForm(invalidType).type).toBe('Selecciona un tipo de cuenta válido.');
    expect(validateAccountForm(negative).balance).toBe('El saldo no puede ser negativo.');
    expect(validateAccountForm(nonNumeric).balance).toBe('El saldo debe ser un número válido.');
    expect(validateAccountForm({ name: 'Cuenta', type: 'efectivo', balance: '0' })).toEqual({});
  });

  it('extrae los errores de validación del API', () => {
    const error = new ApiError(
      422,
      'VALIDACION_FALLIDA',
      'Revisa los datos enviados.',
      { name: ['Ya existe una cuenta con este nombre.'], balance: ['El saldo es obligatorio.'] },
      {},
    );

    expect(toAccountFieldErrors(error)).toEqual({
      name: 'Ya existe una cuenta con este nombre.',
      balance: 'El saldo es obligatorio.',
    });
    expect(getAccountErrorMessage(error)).toBe('Revisa los datos enviados.');
    expect(getAccountErrorMessage(new Error('fallo'))).toBe('Ocurrió un error inesperado. Inténtalo de nuevo.');
  });
});
