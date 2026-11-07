import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes, useParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchAccount, type Account } from '../../lib/accounts';
import { ApiError } from '../../lib/apiClient';
import { fetchAllCategories, type Category } from '../../lib/categories';
import { createTransaction, todayIsoDate, type Transaction } from '../../lib/transactions';
import type * as TransactionsModule from '../../lib/transactions';

import TransaccionForm from './TransaccionForm';

vi.mock('../../lib/accounts', () => ({
  fetchAccount: vi.fn(),
}));

vi.mock('../../lib/categories', () => ({
  fetchAllCategories: vi.fn(),
}));

vi.mock('../../lib/transactions', async () => {
  const actual = await vi.importActual<typeof TransactionsModule>('../../lib/transactions');

  return {
    ...actual,
    createTransaction: vi.fn(),
  };
});

const fetchAccountMock = vi.mocked(fetchAccount);
const fetchCategoriesMock = vi.mocked(fetchAllCategories);
const createTransactionMock = vi.mocked(createTransaction);

const account: Account = {
  id: 7,
  user_id: 1,
  nombre: 'Cuenta principal',
  saldo: '1500.50',
  tipo: 'ahorros',
};

const categories: Category[] = [
  { id: 3, user_id: 1, nombre: 'Comida', tipo: 'gasto' },
  { id: 4, user_id: 1, nombre: 'Salario', tipo: 'ingreso' },
];

const transaction: Transaction = {
  id: 99,
  cuenta_id: 7,
  categoria_id: 3,
  tipo: 'gasto',
  monto: '120.50',
  descripcion: 'Súper',
  fecha: '2026-11-07',
};

const DetalleMarker: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return <div>Detalle {id}</div>;
};

function renderForm() {
  window.history.replaceState({}, '', '/cuentas/7/transacciones/nueva');

  return render(
    <IonApp>
      <IonReactRouter>
        <Routes>
          <Route path="/cuentas/:id/transacciones/nueva" element={<TransaccionForm />} />
          <Route path="/transacciones/:id" element={<DetalleMarker />} />
        </Routes>
      </IonReactRouter>
    </IonApp>,
  );
}

function setInput(testId: string, value: string): void {
  fireEvent(
    screen.getByTestId(testId),
    new CustomEvent('ionInput', {
      detail: { value },
      bubbles: true,
    }),
  );
}

function setSelect(testId: string, value: string): void {
  fireEvent(
    screen.getByTestId(testId),
    new CustomEvent('ionChange', {
      detail: { value },
      bubbles: true,
    }),
  );
}

function submitForm(): void {
  fireEvent.submit(screen.getByRole('form', { name: 'Formulario de transacción' }));
}

describe('TransaccionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchAccountMock.mockResolvedValue(account);
    fetchCategoriesMock.mockResolvedValue(categories);
    createTransactionMock.mockResolvedValue(transaction);
  });

  it('registra una transacción y navega a su detalle', async () => {
    renderForm();

    expect(await screen.findByText('Cuenta: Cuenta principal')).toBeInTheDocument();

    setSelect('transaccion-categoria', '3');
    setInput('transaccion-monto', '120.50');
    setInput('transaccion-descripcion', 'Súper');
    submitForm();

    expect(await screen.findByText('Detalle 99')).toBeInTheDocument();
    expect(createTransactionMock).toHaveBeenCalledWith({
      account_id: 7,
      category_id: 3,
      type: 'gasto',
      amount: 120.5,
      description: 'Súper',
      transaction_date: todayIsoDate(),
    });
  });

  it('valida categoría y monto antes de enviar', async () => {
    renderForm();

    await screen.findByText('Cuenta: Cuenta principal');
    submitForm();

    expect(await screen.findByText('El monto de la transacción es obligatorio.')).toBeInTheDocument();
    expect(screen.getByTestId('transaccion-categoria')).toHaveClass('ion-invalid');
    expect(createTransactionMock).not.toHaveBeenCalled();
  });

  it('muestra los errores de validación devueltos por el API', async () => {
    createTransactionMock.mockRejectedValueOnce(
      new ApiError(
        422,
        'VALIDACION_FALLIDA',
        'Revisa los datos enviados.',
        { amount: ['El monto no es válido.'], category_id: ['La categoría no pertenece al usuario.'] },
        {},
      ),
    );

    renderForm();

    await screen.findByText('Cuenta: Cuenta principal');
    setSelect('transaccion-categoria', '3');
    setInput('transaccion-monto', '20');
    submitForm();

    expect(await screen.findByText('El monto no es válido.')).toBeInTheDocument();
    expect(screen.getByTestId('transaccion-categoria')).toHaveClass('ion-invalid');
    expect(screen.getByText('Revisa los datos enviados.')).toBeInTheDocument();
  });
});
