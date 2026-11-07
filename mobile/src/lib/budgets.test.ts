import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as ApiClientModule from './apiClient';
import { apiClient, ApiError } from './apiClient';
import {
  buildBudgetPayload,
  createBudget,
  emptyBudgetForm,
  fetchBudgetsPage,
  getBudgetErrorMessage,
  monthLabel,
  toBudgetFieldErrors,
  validateBudgetForm,
  type Budget,
  type BudgetFormValues,
} from './budgets';
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

const budget: Budget = {
  id: 12,
  user_id: 1,
  categoria_id: 3,
  nombre: 'Comida',
  monto_maximo: '2500.00',
  mes: 11,
  año: 2026,
};

function page(data: Budget[]): PaginatedResponse<Budget> {
  return {
    data,
    meta: {
      current_page: 1,
      last_page: 1,
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

describe('budgets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista presupuestos y crea uno con el payload del backend', async () => {
    const response = page([budget]);
    getRequest.mockResolvedValue(response);
    postRequest.mockResolvedValue({ data: budget });

    await expect(fetchBudgetsPage()).resolves.toEqual(response);
    expect(getRequest).toHaveBeenCalledWith('/budgets?page=1&per_page=50');

    const payload = buildBudgetPayload({
      name: '  Comida  ',
      categoryId: '3',
      maxAmount: '2500',
      month: '11',
      year: '2026',
    });

    await expect(createBudget(payload)).resolves.toEqual(budget);
    expect(postRequest).toHaveBeenCalledWith('/budgets', {
      category_id: 3,
      name: 'Comida',
      maxAmount: 2500,
      month: 11,
      year: 2026,
    });
  });

  it('construye el formulario vacío para el período actual', () => {
    expect(emptyBudgetForm(new Date(2026, 10, 7))).toEqual({
      name: '',
      categoryId: '',
      maxAmount: '',
      month: '11',
      year: '2026',
    });
    expect(monthLabel(11)).toBe('Noviembre');
    expect(monthLabel(13)).toBe('13');
  });

  it('valida nombre, categoría, monto, mes, año y período retroactivo', () => {
    const now = new Date(2026, 10, 7);
    const base: BudgetFormValues = {
      name: 'Comida',
      categoryId: '3',
      maxAmount: '2500',
      month: '11',
      year: '2026',
    };

    expect(validateBudgetForm(base, now)).toEqual({});
    expect(validateBudgetForm({ ...base, name: ' A ', categoryId: '', maxAmount: '' }, now)).toEqual({
      name: 'El nombre del presupuesto debe tener al menos 3 caracteres.',
      categoryId: 'La categoría es obligatoria.',
      maxAmount: 'El monto máximo del presupuesto es obligatorio.',
    });
    expect(validateBudgetForm({ ...base, maxAmount: 'abc' }, now).maxAmount).toBe(
      'El monto máximo debe ser un número válido.',
    );
    expect(validateBudgetForm({ ...base, month: '13', year: '2101' }, now)).toEqual({
      month: 'El mes debe estar entre 1 y 12.',
      year: 'El año debe estar entre 2020 y 2100.',
    });
    expect(validateBudgetForm({ ...base, month: '10', year: '2026' }, now).month).toBe(
      'No se puede crear un presupuesto para un período que ya pasó.',
    );
  });

  it('extrae los errores de validación del API', () => {
    const error = new ApiError(
      422,
      'VALIDACION_FALLIDA',
      'Revisa los datos enviados.',
      { maxAmount: ['Supera el monto permitido.'], category_id: ['La categoría no existe.'] },
      {},
    );

    expect(toBudgetFieldErrors(error)).toEqual({
      maxAmount: 'Supera el monto permitido.',
      categoryId: 'La categoría no existe.',
    });
    expect(getBudgetErrorMessage(error)).toBe('Revisa los datos enviados.');
    expect(getBudgetErrorMessage(new Error('fallo'))).toBe('Ocurrió un error inesperado. Inténtalo de nuevo.');
  });
});
