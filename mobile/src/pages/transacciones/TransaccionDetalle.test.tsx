import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchAccount, type Account } from '../../lib/accounts';
import { fetchAllCategories, type Category } from '../../lib/categories';
import { fetchTransaction, type Transaction } from '../../lib/transactions';

import TransaccionDetalle from './TransaccionDetalle';

vi.mock('../../lib/accounts', () => ({
  fetchAccount: vi.fn(),
}));

vi.mock('../../lib/categories', () => ({
  fetchAllCategories: vi.fn(),
}));

vi.mock('../../lib/transactions', () => ({
  fetchTransaction: vi.fn(),
  formatTransactionDate: () => '07 nov 2026',
  transactionTypeLabel: (type: string) => (type === 'gasto' ? 'Gasto' : 'Ingreso'),
}));

const fetchTransactionMock = vi.mocked(fetchTransaction);
const fetchAccountMock = vi.mocked(fetchAccount);
const fetchCategoriesMock = vi.mocked(fetchAllCategories);

const transaction: Transaction = {
  id: 9,
  cuenta_id: 7,
  categoria_id: 3,
  tipo: 'gasto',
  monto: '45.00',
  descripcion: 'Café',
  fecha: '2026-11-07',
};

const account: Account = {
  id: 7,
  user_id: 1,
  nombre: 'Cuenta principal',
  saldo: '1500.50',
  tipo: 'ahorros',
};

const categories: Category[] = [{ id: 3, user_id: 1, nombre: 'Comida', tipo: 'gasto' }];

function renderDetalle(path = '/transacciones/9') {
  window.history.replaceState({}, '', path);

  return render(
    <IonApp>
      <IonReactRouter>
        <Routes>
          <Route path="/transacciones/:id" element={<TransaccionDetalle />} />
          <Route path="/cuentas/:id" element={<div>Cuenta de la transacción</div>} />
          <Route path="/cuentas/:id/transacciones/nueva" element={<div>Nueva transacción</div>} />
        </Routes>
      </IonReactRouter>
    </IonApp>,
  );
}

describe('TransaccionDetalle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchTransactionMock.mockResolvedValue(transaction);
    fetchAccountMock.mockResolvedValue(account);
    fetchCategoriesMock.mockResolvedValue(categories);
  });

  it('muestra los datos de la transacción y navega a la cuenta', async () => {
    renderDetalle();

    expect(await screen.findByText('Café')).toBeInTheDocument();
    expect(screen.getByTestId('transaccion-monto')).toHaveTextContent('-$ 45.00');
    expect(screen.getByText('Comida')).toBeInTheDocument();
    expect(screen.getByText('07 nov 2026')).toBeInTheDocument();
    expect(screen.getByText('Cuenta principal')).toBeInTheDocument();
    expect(fetchTransactionMock).toHaveBeenCalledWith(9);

    fireEvent.click(screen.getByTestId('transaccion-cuenta'));

    expect(await screen.findByText('Cuenta de la transacción')).toBeInTheDocument();
  });

  it('navega al formulario para registrar otra transacción', async () => {
    renderDetalle();

    await screen.findByText('Café');
    fireEvent.click(screen.getByText('Registrar otra'));

    expect(await screen.findByText('Nueva transacción')).toBeInTheDocument();
  });

  it('muestra el error inicial y permite reintentar', async () => {
    fetchTransactionMock.mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce(transaction);

    renderDetalle();

    expect(await screen.findByText('Sin conexión')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Reintentar'));

    expect(await screen.findByText('Café')).toBeInTheDocument();
    expect(fetchTransactionMock).toHaveBeenCalledTimes(2);
  });

  it('rechaza un identificador inválido sin llamar a la API', async () => {
    renderDetalle('/transacciones/abc');

    expect(await screen.findByText('La transacción solicitada no es válida.')).toBeInTheDocument();
    expect(fetchTransactionMock).not.toHaveBeenCalled();
  });
});
