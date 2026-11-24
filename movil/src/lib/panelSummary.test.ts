import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from './apiClient';
import type { PaginatedResponse } from './pagination';
import {
  buildPanelSummary,
  formatMoney,
  loadPanelSummary,
  type Account,
  type Budget,
  type GroupDebt,
  type Transaction,
} from './panelSummary';

vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const getRequest = vi.mocked(apiClient.get);

function page<T>(data: T[], currentPage = 1, lastPage = 1): PaginatedResponse<T> {
  return {
    data,
    meta: {
      current_page: currentPage,
      last_page: lastPage,
      per_page: 50,
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

describe('panelSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calcula saldos, presupuestos en riesgo y deudas pendientes', () => {
    const accounts: Account[] = [
      { id: 1, nombre: 'Efectivo', saldo: '1000.50', tipo: 'efectivo' },
      { id: 2, nombre: 'Banco', saldo: '500', tipo: 'banco' },
    ];
    const budgets: Budget[] = [
      { id: 1, categoria_id: 10, nombre: 'Comida', monto_maximo: '1000', mes: 11, año: 2026 },
      { id: 2, categoria_id: 20, nombre: 'Transporte', monto_maximo: '100', mes: 11, año: 2026 },
      { id: 3, categoria_id: 30, nombre: 'Sin límite', monto_maximo: '0', mes: 11, año: 2026 },
    ];
    const debts: GroupDebt[] = [
      { id: 1, deudor_id: 1, acreedor_id: 2, monto_total: '250', estado: 'pending' },
      { id: 2, deudor_id: 3, acreedor_id: 1, monto_total: '100', estado: 'pending' },
      { id: 3, deudor_id: 1, acreedor_id: 4, monto_total: '999', estado: 'paid' },
      { id: 4, deudor_id: 5, acreedor_id: 6, monto_total: '1000', estado: 'pending' },
    ];
    const expenses: Transaction[] = [
      { id: 1, categoria_id: 10, tipo: 'gasto', monto: 800, fecha: '2026-11-10' },
      { id: 2, categoria_id: 20, tipo: 'gasto', monto: 79.99, fecha: '2026-11-11' },
    ];

    const summary = buildPanelSummary({ userId: 1, accounts, budgets, debts, expenses });

    expect(summary).toEqual({
      accountsCount: 2,
      totalBalance: 1500.5,
      budgetsNearLimit: 1,
      owedByUser: 250,
      owedToUser: 100,
    });
  });

  it('formatea los montos con dos decimales', () => {
    expect(formatMoney(1500.5)).toBe('$ 1500.50');
    expect(formatMoney(-10)).toBe('$ -10.00');
    expect(formatMoney(Number.NaN)).toBe('$ 0.00');
  });

  it('carga los datos del mes actual y pagina las transacciones', async () => {
    const accounts: Account[] = [{ id: 1, nombre: 'Efectivo', saldo: '1500.50', tipo: 'efectivo' }];
    const budgets: Budget[] = [{ id: 1, categoria_id: 10, nombre: 'Comida', monto_maximo: '1000', mes: 11, año: 2026 }];
    const debts: GroupDebt[] = [{ id: 1, deudor_id: 1, acreedor_id: 2, monto_total: '250', estado: 'pending' }];
    const firstExpenses: Transaction[] = [{ id: 1, categoria_id: 10, tipo: 'gasto', monto: 400, fecha: '2026-11-10' }];
    const secondExpenses: Transaction[] = [{ id: 2, categoria_id: 10, tipo: 'gasto', monto: 400, fecha: '2026-11-11' }];

    getRequest
      .mockResolvedValueOnce(page(accounts))
      .mockResolvedValueOnce(page(budgets))
      .mockResolvedValueOnce(page(debts))
      .mockResolvedValueOnce(page(firstExpenses, 1, 2))
      .mockResolvedValueOnce(page(secondExpenses, 2, 2));

    const summary = await loadPanelSummary(1, new Date(2026, 10, 15));

    expect(summary).toEqual({
      accountsCount: 1,
      totalBalance: 1500.5,
      budgetsNearLimit: 1,
      owedByUser: 250,
      owedToUser: 0,
    });

    expect(getRequest).toHaveBeenCalledWith('/accounts?per_page=50');
    expect(getRequest).toHaveBeenCalledWith('/budgets?month=11&year=2026&per_page=50');
    expect(getRequest).toHaveBeenCalledWith('/group-debts?status=pending&per_page=50');
    expect(getRequest).toHaveBeenCalledWith('/transactions?type=gasto&from=2026-11-01&to=2026-11-30&per_page=50');
    expect(getRequest).toHaveBeenCalledWith(
      '/transactions?type=gasto&from=2026-11-01&to=2026-11-30&per_page=50&page=2',
    );
  });
});
