import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchAccount, type Account } from '../../lib/accounts';

import CuentaDetalle from './CuentaDetalle';

vi.mock('../../lib/accounts', () => ({
  accountTypeLabel: (type: string) => (type === 'ahorros' ? 'Ahorros' : type),
  fetchAccount: vi.fn(),
}));

const fetchAccountMock = vi.mocked(fetchAccount);

const account: Account = {
  id: 7,
  user_id: 1,
  nombre: 'Cuenta principal',
  saldo: '1500.50',
  tipo: 'ahorros',
};

function renderDetalle(path = '/cuentas/7') {
  window.history.replaceState({}, '', path);

  return render(
    <IonApp>
      <IonReactRouter>
        <Routes>
          <Route path="/cuentas/:id" element={<CuentaDetalle />} />
          <Route path="/cuentas/:id/editar" element={<div>Editar cuenta</div>} />
        </Routes>
      </IonReactRouter>
    </IonApp>,
  );
}

describe('CuentaDetalle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchAccountMock.mockResolvedValue(account);
  });

  it('muestra el detalle y navega a la edición', async () => {
    renderDetalle();

    expect(await screen.findByText('Cuenta principal')).toBeInTheDocument();
    expect(screen.getByText('Ahorros')).toBeInTheDocument();
    expect(screen.getByTestId('cuenta-saldo')).toHaveTextContent('$ 1500.50');
    expect(fetchAccountMock).toHaveBeenCalledWith(7);

    fireEvent.click(screen.getByText('Editar'));

    expect(await screen.findByText('Editar cuenta')).toBeInTheDocument();
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
  });
});
