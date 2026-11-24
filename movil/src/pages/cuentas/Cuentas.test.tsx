import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchAccountsPage, type Account } from '../../lib/accounts';
import { fetchBudgetsPage, type Budget } from '../../lib/budgets';
import type { PaginatedResponse } from '../../lib/pagination';

import Cuentas from './Cuentas';

vi.mock('../../lib/accounts', () => ({
  accountTypeLabel: (type: string) => type,
  fetchAccountsPage: vi.fn(),
}));

vi.mock('../../lib/budgets', () => ({
  fetchBudgetsPage: vi.fn(),
  monthLabel: (month: number) => (month === 11 ? 'Noviembre' : String(month)),
}));

const fetchPage = vi.mocked(fetchAccountsPage);
const fetchBudgets = vi.mocked(fetchBudgetsPage);

const accounts: Account[] = [
  { id: 7, user_id: 1, nombre: 'Ahorros', saldo: '1500.50', tipo: 'ahorros' },
  { id: 8, user_id: 1, nombre: 'Efectivo', saldo: 120, tipo: 'efectivo' },
];

const budgets: Budget[] = [
  { id: 3, user_id: 1, categoria_id: 1, nombre: 'Comida', monto_maximo: '2500.00', mes: 11, año: 2026 },
];

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

function renderCuentas() {
  window.history.replaceState({}, '', '/cuentas');

  return render(
    <IonApp>
      <IonReactRouter>
        <Routes>
          <Route path="/cuentas" element={<Cuentas />} />
          <Route path="/cuentas/nueva" element={<div>Nueva cuenta</div>} />
          <Route path="/cuentas/:id" element={<div>Detalle de cuenta</div>} />
          <Route path="/presupuestos/nuevo" element={<div>Nuevo presupuesto</div>} />
        </Routes>
      </IonReactRouter>
    </IonApp>,
  );
}

describe('Cuentas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchPage.mockResolvedValue(page(accounts));
    fetchBudgets.mockResolvedValue(page(budgets));
  });

  it('muestra las cuentas y navega al detalle', async () => {
    renderCuentas();

    expect(await screen.findByText('Ahorros')).toBeInTheDocument();
    expect(screen.getByText('ahorros')).toBeInTheDocument();
    expect(screen.getByText('$ 1500.50')).toBeInTheDocument();
    expect(screen.getByText('$ 120.00')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('cuenta-7'));

    expect(await screen.findByText('Detalle de cuenta')).toBeInTheDocument();
  });

  it('muestra los presupuestos y permite crear uno', async () => {
    renderCuentas();

    expect(await screen.findByText('Comida')).toBeInTheDocument();
    expect(screen.getByText('Noviembre 2026')).toBeInTheDocument();
    expect(screen.getByText('$ 2500.00')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Crear presupuesto'));

    expect(await screen.findByText('Nuevo presupuesto')).toBeInTheDocument();
  });

  it('muestra el estado vacío y permite crear una cuenta', async () => {
    fetchPage.mockResolvedValue(page([]));

    renderCuentas();

    expect(await screen.findByText('Aún no tienes cuentas.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Crear tu primera cuenta'));

    expect(await screen.findByText('Nueva cuenta')).toBeInTheDocument();
  });

  it('muestra el error inicial y permite reintentar', async () => {
    fetchPage.mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce(page(accounts));

    renderCuentas();

    expect(await screen.findByText('Sin conexión')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Reintentar'));

    expect(await screen.findByText('Ahorros')).toBeInTheDocument();
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it('permite abrir el formulario de alta desde la cabecera', async () => {
    renderCuentas();

    await screen.findByText('Ahorros');
    fireEvent.click(screen.getByLabelText('Crear cuenta'));

    expect(await screen.findByText('Nueva cuenta')).toBeInTheDocument();
  });
});
