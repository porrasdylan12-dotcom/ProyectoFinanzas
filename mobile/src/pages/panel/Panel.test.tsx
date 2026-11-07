import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext, type AuthContextValue } from '../../auth/AuthContext';
import { loadPanelSummary, type PanelSummary } from '../../lib/panelSummary';

import Panel from './Panel';

vi.mock('../../lib/panelSummary', () => ({
  formatMoney: (value: number) => `$ ${value.toFixed(2)}`,
  loadPanelSummary: vi.fn(),
}));

const loadSummary = vi.mocked(loadPanelSummary);
const logout = vi.fn().mockResolvedValue(undefined);

const authValue: AuthContextValue = {
  user: { id: 1, nombre: 'Erick', email: 'erick@example.com' },
  status: 'authenticated',
  login: async () => undefined,
  register: async () => undefined,
  logout,
};

const summary: PanelSummary = {
  accountsCount: 3,
  totalBalance: 1500.5,
  budgetsNearLimit: 2,
  owedByUser: 250,
  owedToUser: 100,
};

function renderPanel() {
  window.history.replaceState({}, '', '/panel');

  return render(
    <AuthContext.Provider value={authValue}>
      <IonApp>
        <IonReactRouter>
          <Routes>
            <Route path="/panel" element={<Panel />} />
            <Route path="/cuentas" element={<div>Pantalla de cuentas</div>} />
            <Route path="/grupos" element={<div>Pantalla de grupos</div>} />
            <Route path="/ajustes" element={<div>Pantalla de ajustes</div>} />
          </Routes>
        </IonReactRouter>
      </IonApp>
    </AuthContext.Provider>,
  );
}

describe('Panel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadSummary.mockResolvedValue(summary);
  });

  it('muestra el resumen de cuentas, grupos y usuario', async () => {
    renderPanel();

    expect(await screen.findByText('Hola, Erick.')).toBeInTheDocument();
    expect(screen.getByText('erick@example.com')).toBeInTheDocument();
    expect(screen.getByText('$ 1500.50')).toBeInTheDocument();
    expect(screen.getByText('Presupuestos cerca del límite')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Debes')).toBeInTheDocument();
    expect(screen.getByText('$ 250.00')).toBeInTheDocument();
    expect(screen.getByText('Te deben')).toBeInTheDocument();
    expect(screen.getByText('$ 100.00')).toBeInTheDocument();
    expect(loadSummary).toHaveBeenCalledWith(1);
  });

  it('muestra el error inicial y permite reintentar', async () => {
    loadSummary.mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce(summary);

    renderPanel();

    expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión');

    fireEvent.click(screen.getByText('Reintentar'));

    expect(await screen.findByText('Hola, Erick.')).toBeInTheDocument();
    expect(loadSummary).toHaveBeenCalledTimes(2);
  });

  it('navega a cuentas desde el resumen', async () => {
    renderPanel();

    await screen.findByText('Hola, Erick.');
    fireEvent.click(screen.getByText('Ir a Cuentas'));

    expect(await screen.findByText('Pantalla de cuentas')).toBeInTheDocument();
  });

  it('cierra la sesión desde la tarjeta de usuario', async () => {
    renderPanel();

    await screen.findByText('Hola, Erick.');
    fireEvent.click(screen.getByText('Cerrar sesión'));

    expect(logout).toHaveBeenCalledOnce();
  });
});
