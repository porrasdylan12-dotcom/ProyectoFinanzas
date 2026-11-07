import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes, useParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../lib/apiClient';
import { createAccount, fetchAccount, updateAccount, type Account } from '../../lib/accounts';

import CuentaForm from './CuentaForm';

vi.mock('../../lib/accounts', async () => {
  const actual = await vi.importActual<typeof import('../../lib/accounts')>('../../lib/accounts');

  return {
    ...actual,
    createAccount: vi.fn(),
    fetchAccount: vi.fn(),
    updateAccount: vi.fn(),
  };
});

const createAccountMock = vi.mocked(createAccount);
const fetchAccountMock = vi.mocked(fetchAccount);
const updateAccountMock = vi.mocked(updateAccount);

const account: Account = {
  id: 7,
  user_id: 1,
  nombre: 'Cuenta principal',
  saldo: '1500.50',
  tipo: 'ahorros',
};

const DetalleMarker: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return <div>Detalle {id}</div>;
};

function renderForm(path: string) {
  window.history.replaceState({}, '', path);

  return render(
    <IonApp>
      <IonReactRouter>
        <Routes>
          <Route path="/cuentas/nueva" element={<CuentaForm />} />
          <Route path="/cuentas/:id/editar" element={<CuentaForm />} />
          <Route path="/cuentas/:id" element={<DetalleMarker />} />
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
  fireEvent.submit(screen.getByRole('form', { name: 'Formulario de cuenta' }));
}

describe('CuentaForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchAccountMock.mockResolvedValue(account);
    createAccountMock.mockResolvedValue({ ...account, id: 9 });
    updateAccountMock.mockResolvedValue(account);
  });

  it('crea una cuenta y navega a su detalle', async () => {
    renderForm('/cuentas/nueva');

    setInput('cuenta-nombre', 'Viajes');
    setSelect('cuenta-tipo', 'corriente');
    setInput('cuenta-saldo', '250.75');
    submitForm();

    expect(await screen.findByText('Detalle 9')).toBeInTheDocument();
    expect(createAccountMock).toHaveBeenCalledWith({
      name: 'Viajes',
      type: 'corriente',
      balance: 250.75,
    });
  });

  it('valida el formulario antes de enviar', async () => {
    renderForm('/cuentas/nueva');

    submitForm();

    expect(await screen.findByText('El nombre de la cuenta es obligatorio.')).toBeInTheDocument();
    expect(createAccountMock).not.toHaveBeenCalled();
  });

  it('carga y actualiza una cuenta existente', async () => {
    renderForm('/cuentas/7/editar');

    expect(await screen.findByText('Guardar cambios')).toBeInTheDocument();
    expect(fetchAccountMock).toHaveBeenCalledWith(7);

    setInput('cuenta-nombre', 'Cuenta editada');
    setInput('cuenta-saldo', '200');
    submitForm();

    expect(await screen.findByText('Detalle 7')).toBeInTheDocument();
    expect(updateAccountMock).toHaveBeenCalledWith(7, {
      name: 'Cuenta editada',
      type: 'ahorros',
      balance: 200,
    });
  });

  it('muestra los errores de validación devueltos por el API', async () => {
    createAccountMock.mockRejectedValueOnce(
      new ApiError(
        422,
        'VALIDACION_FALLIDA',
        'Revisa los datos enviados.',
        { name: ['Ya existe una cuenta con este nombre.'] },
        {},
      ),
    );

    renderForm('/cuentas/nueva');

    setInput('cuenta-nombre', 'Repetida');
    submitForm();

    expect(await screen.findByText('Ya existe una cuenta con este nombre.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Revisa los datos enviados.');
  });
});
