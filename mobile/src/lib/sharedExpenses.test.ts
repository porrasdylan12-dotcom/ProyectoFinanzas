import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient, ApiError } from './apiClient';
import type * as ApiClientModule from './apiClient';
import type { GroupDebt } from './groupDebts';
import type { PaginatedResponse } from './pagination';
import {
  buildSharedExpensePayload,
  createSharedExpense,
  emptySharedExpenseForm,
  fetchSharedExpense,
  fetchSharedExpensesPage,
  formatSharedExpenseDate,
  getSharedExpenseErrorMessage,
  toSharedExpenseFieldErrors,
  validateSharedExpenseForm,
  type SharedExpense,
} from './sharedExpenses';

vi.mock('./apiClient', async () => {
  const actual = await vi.importActual<typeof ApiClientModule>('./apiClient');

  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

const getRequest = vi.mocked(apiClient.get);
const postRequest = vi.mocked(apiClient.post);

const debt: GroupDebt = {
  id: 11,
  gasto_compartido_id: 9,
  deudor_id: 2,
  acreedor_id: 1,
  monto_total: '500.00',
  estado: 'pending',
};

const expense: SharedExpense = {
  id: 9,
  grupo_id: 5,
  usuario_id: 1,
  monto: '1000.00',
  descripcion: 'Cena',
  fecha: '2026-11-07',
  participantes: [1, 2],
  deudas: [debt],
};

function page<T>(data: T[]): PaginatedResponse<T> {
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

describe('sharedExpenses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inicializa, valida y construye el formulario de gasto', () => {
    const values = emptySharedExpenseForm([1, 2], '2026-11-07');

    expect(values).toEqual({
      amount: '',
      description: '',
      date: '2026-11-07',
      participantIds: [1, 2],
    });
    expect(validateSharedExpenseForm(values)).toEqual({
      amount: 'El monto del gasto compartido es obligatorio.',
    });
    expect(
      validateSharedExpenseForm({
        amount: '100',
        description: '',
        date: '2026-11-07',
        participantIds: [1],
      }),
    ).toEqual({ participantIds: 'Debes seleccionar al menos 2 participantes.' });
    expect(
      validateSharedExpenseForm({
        amount: '100',
        description: '',
        date: '2026-02-30',
        participantIds: [1, 2],
      }),
    ).toEqual({ date: 'La fecha debe ser una fecha válida.' });

    expect(
      buildSharedExpensePayload({
        amount: '100.50',
        description: '  Cena  ',
        date: '2026-11-07',
        participantIds: [1, 2],
      }),
    ).toEqual({
      amount: 100.5,
      description: 'Cena',
      date: '2026-11-07',
      participants: [1, 2],
    });
  });

  it('traduce errores del API y formatea la fecha', () => {
    const error = new ApiError(422, 'VALIDACION_FALLIDA', 'Revisa los datos enviados.', {
      'participants.0': ['Uno de los participantes no existe en el sistema.'],
    });

    expect(toSharedExpenseFieldErrors(error)).toEqual({
      participantIds: 'Uno de los participantes no existe en el sistema.',
    });
    expect(getSharedExpenseErrorMessage(error)).toBe('Revisa los datos enviados.');
    expect(getSharedExpenseErrorMessage(new Error('fallo'))).toBe('Ocurrió un error inesperado. Inténtalo de nuevo.');
    expect(formatSharedExpenseDate('2026-11-07')).toBe('07 nov 2026');
  });

  it('consulta y crea gastos compartidos', async () => {
    getRequest.mockResolvedValueOnce(page([expense])).mockResolvedValueOnce({ data: expense });
    postRequest.mockResolvedValueOnce({ data: expense });

    await expect(fetchSharedExpensesPage(5)).resolves.toEqual(page([expense]));
    await expect(fetchSharedExpense(9)).resolves.toEqual(expense);
    await expect(
      createSharedExpense(5, {
        amount: 1000,
        description: 'Cena',
        date: '2026-11-07',
        participants: [1, 2],
      }),
    ).resolves.toEqual(expense);

    expect(getRequest).toHaveBeenNthCalledWith(
      1,
      '/groups/5/shared-expenses?page=1&per_page=20&sort_by=date&sort_dir=desc',
    );
    expect(getRequest).toHaveBeenNthCalledWith(2, '/shared-expenses/9');
    expect(postRequest).toHaveBeenCalledWith('/groups/5/shared-expenses', {
      amount: 1000,
      description: 'Cena',
      date: '2026-11-07',
      participants: [1, 2],
    });
  });
});
