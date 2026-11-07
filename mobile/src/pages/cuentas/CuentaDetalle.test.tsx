import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchAccount, type Account } from '../../lib/accounts';
import { fetchAllCategories, type Category } from '../../lib/categories';
import type { PaginatedResponse } from '../../lib/pagination';
import { fetchTransactionsPage, type Transaction } from '../../lib/transactions';

import CuentaDetalle from './CuentaDetalle';

vi.mock('../../lib/accounts', () => ({
  accountTypeLabel: (type: string) => (type === 'ahorros' ? 'Ahorros' : type),
  fetchAccount: vi.fn(),
}));

vi.mock('../../lib/categories', () => ({
  fetchAllCategories: vi.fn(),
}));

vi.mock('../../lib/transactions', () => ({
  fetchTransactionsPage: vi.fn(),
  formatTransactionDate: () => '07 nov 2026',
  transactionTypeLabel: (type: string) => (type === 'gasto' ? 'Gasto' : 'Ingreso'),
}));

const fetchAccountMock = vi.mocked(fetchAccount);
const fetchCategoriesMock = vi.mocked(fetchAllCategories);
const fetchTransactionsMock = vi.mocked(fetchTransactionsPage);

const account: Account = {
  id: 7,
  user_id: 1,
  nombre: 'Cuenta principal',
  saldo: '1500.50',
  tipo: 'ahorros',
};

const categories: Category[] = [{ id: 3, user_id: 1, nombre: 'Comida', tipo: 'gasto' }];

const transactions: Transaction[] = [
  {
    id: 9,
    cuenta_id: 7,
    categoria_id: 3,
    tipo: 'gasto',
    monto: '45.00',
    descripcion: 'Café',
    fecha: '2026-11-07',
  },
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

function renderDetalle(path = '/cuentas/7') {
  window.history.replaceState({}, '', path);

  return render(
    <IonApp>
      <IonReactRouter>
        <Routes>
          <Route path="/cuentas/:id" element={<CuentaDetalle />} />
          <Route path="/cuentas/:id/editar" element={<div>Editar cuenta</div>} />
          <Route path="/cuentas/:id/transacciones/nueva" element={<div>Nueva transacción</div>} />
          <Route path="/transacciones/:id" element={<div>Detalle de transacción</div>} />
        </Routes>
      </IonReactRouter>
    </IonApp>,
  );
}

describe('CuentaDetalle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchAccountMock.mockResolvedValue(account);
    fetchCategoriesMock.mockResolvedValue(categories);
    fetchTransactionsMock.mockResolvedValue(page(transactions));
  });

  it('muestra el detalle, las transacciones y navega a la edición', async () => {
    renderDetalle();

    expect(await screen.findByText('Cuenta principal')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ahorros' })).toBeInTheDocument();
    expect(screen.getByTestId('cuenta-saldo')).toHaveTextContent('$ 1500.50');
    expect(fetchAccountMock).toHaveBeenCalledWith(7);
    expect(fetchTransactionsMock).toHaveBeenCalledWith(7, 1, 20);

    expect(await screen.findByText('Café')).toBeInTheDocument();
    expect(screen.getByText(/Comida/)).toBeInTheDocument();
    expect(screen.getByText('-$ 45.00')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Editar'));

    expect(await screen.findByText('Editar cuenta')).toBeInTheDocument();
  });

  it('navega al detalle de una transacción', async () => {
    renderDetalle();

    fireEvent.click(await screen.findByTestId('transaccion-9'));

    expect(await screen.findByText('Detalle de transacción')).toBeInTheDocument();
  });

  it('navega al formulario de alta de transacción', async () => {
    renderDetalle();

    fireEvent.click(await screen.findByText('Registrar'));

    expect(await screen.findByText('Nueva transacción')).toBeInTheDocument();
  });

  it('muestra el error inicial y permite reintentar', async () => {
    fetchAccountMock.mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce(account);

    renderDetalle();

    expect(await screen.findByText('Sin conexión')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Reintentar'));

    expect(await screen.findByText('Cuenta principal')).toBeInTheDocument();
    expect(fetchAccountMock).toHaveBeenCalledTimes(2);
  });

  it('rechaza un identificador inválido sin llamar a la API', async () => {
    renderDetalle('/cuentas/abc');

    expect(await screen.findByText('La cuenta solicitada no es válida.')).toBeInTheDocument();
    expect(fetchAccountMock).not.toHaveBeenCalled();
    expect(fetchTransactionsMock).not.toHaveBeenCalled();
  });
});
