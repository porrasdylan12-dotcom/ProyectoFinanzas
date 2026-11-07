import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AuthContext, type AuthContextValue } from '../auth/AuthContext';

import AppTabs from './AppTabs';

vi.mock('../lib/panelSummary', () => ({
  formatMoney: (value: number) => `$ ${value.toFixed(2)}`,
  loadPanelSummary: async () => ({
    accountsCount: 0,
    totalBalance: 0,
    budgetsNearLimit: 0,
    owedByUser: 0,
    owedToUser: 0,
  }),
}));

vi.mock('../lib/accounts', () => ({
  accountTypeLabel: (type: string) => type,
  fetchAccountsPage: async () => ({
    data: [],
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
      from: null,
      to: null,
    },
    links: {
      first: null,
      last: null,
      prev: null,
      next: null,
    },
  }),
}));

vi.mock('../lib/budgets', () => ({
  fetchBudgetsPage: async () => ({
    data: [],
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 50,
      total: 0,
      from: null,
      to: null,
    },
    links: {
      first: null,
      last: null,
      prev: null,
      next: null,
    },
  }),
  monthLabel: (month: number) => String(month),
}));

vi.mock('../lib/groups', () => ({
  fetchGroupsPage: async () => ({
    data: [],
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
      from: null,
      to: null,
    },
    links: {
      first: null,
      last: null,
      prev: null,
      next: null,
    },
  }),
}));

const authValue: AuthContextValue = {
  user: { id: 1, nombre: 'Erick', email: 'erick@example.com' },
  status: 'authenticated',
  login: async () => undefined,
  register: async () => undefined,
  logout: async () => undefined,
};

function renderTabs(path: string) {
  window.history.replaceState({}, '', path);

  return render(
    <AuthContext.Provider value={authValue}>
      <IonApp>
        <IonReactRouter>
          <AppTabs />
        </IonReactRouter>
      </IonApp>
    </AuthContext.Provider>,
  );
}

describe('AppTabs', () => {
  it('muestra el panel con la barra de tabs', async () => {
    renderTabs('/panel');

    expect(await screen.findByText('Hola, Erick.', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByTestId('tab-panel')).toBeInTheDocument();
    expect(screen.getByTestId('tab-cuentas')).toBeInTheDocument();
    expect(screen.getByTestId('tab-grupos')).toBeInTheDocument();
    expect(screen.getByTestId('tab-ajustes')).toBeInTheDocument();
  });

  it('muestra la pantalla de cuentas', async () => {
    renderTabs('/cuentas');

    expect(await screen.findByText('Aún no tienes cuentas.')).toBeInTheDocument();
    expect(screen.getByTestId('tab-cuentas')).toBeInTheDocument();
  });

  it('muestra la pantalla de grupos', async () => {
    renderTabs('/grupos');

    expect(await screen.findByText('Aún no tienes grupos.')).toBeInTheDocument();
    expect(screen.getByTestId('tab-grupos')).toBeInTheDocument();
  });

  it('redirige las rutas desconocidas al panel', async () => {
    renderTabs('/ruta-inexistente');

    expect(await screen.findByText('Hola, Erick.', {}, { timeout: 5000 })).toBeInTheDocument();
  });
});
