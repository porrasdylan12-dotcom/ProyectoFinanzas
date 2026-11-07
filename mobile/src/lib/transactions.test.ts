import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as ApiClientModule from './apiClient';
import { apiClient, ApiError } from './apiClient';
import type { PaginatedResponse } from './pagination';
import {
  buildTransactionPayload,
  createTransaction,
  emptyTransactionForm,
  fetchTransaction,
  fetchTransactionsPage,
  formatTransactionDate,
  getTransactionErrorMessage,
  toTransactionFieldErrors,
  todayIsoDate,
  transactionTypeLabel,
  validateTransactionForm,
  type Transaction,
  type TransactionFormValues,
} from './transactions';

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

const transaction: Transaction = {
  id: 9,
  cuenta_id: 7,
  categoria_id: 3,
  tipo: 'gasto',
  monto: '45.00',
  descripcion: 'Café',
  fecha: '2026-11-07',
};

function page(data: Transaction[]): PaginatedResponse<Transaction> {
  return {
    data,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 20,
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

describe('transactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista transacciones de una cuenta con orden descendente', async () => {
    const response = page([transaction]);
    getRequest.mockResolvedValue(response);

    await expect(fetchTransactionsPage(7, 2, 10)).resolves.toEqual(response);
    expect(getRequest).toHaveBeenCalledWith(
      '/transactions?page=2&per_page=10&sort_by=transaction_date&sort_dir=desc&account_id=7',
    );
  });

  it('lista todas las transacciones cuando no se filtra por cuenta', async () => {
    getRequest.mockResolvedValue(page([]));

    await fetchTransactionsPage(null);

    expect(getRequest).toHaveBeenCalledWith('/transactions?page=1&per_page=20&sort_by=transaction_date&sort_dir=desc');
  });

  it('obtiene y crea transacciones con el payload del backend', async () => {
    getRequest.mockResolvedValue({ data: transaction });
    postRequest.mockResolvedValue({ data: transaction });

    await expect(fetchTransaction(9)).resolves.toEqual(transaction);
    expect(getRequest).toHaveBeenCalledWith('/transactions/9');

    const payload = buildTransactionPayload({
      accountId: '7',
      categoryId: '3',
      type: 'gasto',
      amount: '45',
      description: '  Café  ',
      date: '2026-11-07',
    });

    await expect(createTransaction(payload)).resolves.toEqual(transaction);
    expect(postRequest).toHaveBeenCalledWith('/transactions', {
      account_id: 7,
      category_id: 3,
      type: 'gasto',
      amount: 45,
      description: 'Café',
      transaction_date: '2026-11-07',
    });
  });

  it('construye el formulario vacío y etiqueta los tipos', () => {
    expect(emptyTransactionForm(7, '2026-11-07')).toEqual({
      accountId: '7',
      categoryId: '',
      type: 'gasto',
      amount: '',
      description: '',
      date: '2026-11-07',
    });
    expect(transactionTypeLabel('ingreso')).toBe('Ingreso');
    expect(transactionTypeLabel('gasto')).toBe('Gasto');
    expect(transactionTypeLabel('otro')).toBe('otro');
    expect(todayIsoDate(new Date(2026, 10, 7))).toBe('2026-11-07');
  });

  it('valida cuenta, categoría, tipo, monto, fecha y descripción', () => {
    const base = emptyTransactionForm(7, '2026-11-07');
    const invalid: TransactionFormValues = { ...base, accountId: '0', description: 'x'.repeat(1001) };
    const invalidType = { ...base, type: 'otro' } as unknown as TransactionFormValues;

    expect(validateTransactionForm(invalid)).toEqual({
      accountId: 'La cuenta de la transacción no es válida.',
      categoryId: 'La categoría es obligatoria.',
      amount: 'El monto de la transacción es obligatorio.',
      description: 'La descripción no puede superar los 1000 caracteres.',
    });
    expect(validateTransactionForm(invalidType).type).toBe('Selecciona un tipo de transacción válido.');
    expect(validateTransactionForm({ ...base, categoryId: '3', amount: '0' }).amount).toBe(
      'El monto debe ser al menos 0.01.',
    );
    expect(validateTransactionForm({ ...base, categoryId: '3', amount: 'abc' }).amount).toBe(
      'El monto debe ser un número válido.',
    );
    expect(validateTransactionForm({ ...base, categoryId: '3', amount: '1', date: '2026-02-30' }).date).toBe(
      'La fecha debe ser una fecha válida.',
    );
    expect(validateTransactionForm({ ...base, categoryId: '3', amount: '1' })).toEqual({});
  });

  it('extrae los errores de validación del API y formatea la fecha', () => {
    const error = new ApiError(
      422,
      'VALIDACION_FALLIDA',
      'Revisa los datos enviados.',
      { account_id: ['La cuenta no existe.'], amount: ['El monto no es válido.'] },
      {},
    );

    expect(toTransactionFieldErrors(error)).toEqual({
      accountId: 'La cuenta no existe.',
      amount: 'El monto no es válido.',
    });
    expect(getTransactionErrorMessage(error)).toBe('Revisa los datos enviados.');
    expect(getTransactionErrorMessage(new Error('fallo'))).toBe('Ocurrió un error inesperado. Inténtalo de nuevo.');
    expect(formatTransactionDate('2026-11-07')).toContain('2026');
  });
});
