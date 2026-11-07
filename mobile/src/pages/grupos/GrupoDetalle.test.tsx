import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext, type AuthContextValue } from '../../auth/AuthContext';
import { addGroupMember, fetchGroup, type Group } from '../../lib/groups';
import type * as GroupsModule from '../../lib/groups';
import type { PaginatedResponse } from '../../lib/pagination';
import { fetchSharedExpensesPage, type SharedExpense } from '../../lib/sharedExpenses';
import type * as SharedExpensesModule from '../../lib/sharedExpenses';

import GrupoDetalle from './GrupoDetalle';

vi.mock('../../lib/groups', async () => {
  const actual = await vi.importActual<typeof GroupsModule>('../../lib/groups');

  return {
    ...actual,
    addGroupMember: vi.fn(),
    fetchGroup: vi.fn(),
  };
});

vi.mock('../../lib/sharedExpenses', async () => {
  const actual = await vi.importActual<typeof SharedExpensesModule>('../../lib/sharedExpenses');

  return {
    ...actual,
    fetchSharedExpensesPage: vi.fn(),
  };
});

const fetchGroupMock = vi.mocked(fetchGroup);
const addMemberMock = vi.mocked(addGroupMember);
const fetchExpensesMock = vi.mocked(fetchSharedExpensesPage);

const group: Group = {
  id: 5,
  nombre: 'Apartamento 301',
  miembros: [
    { id: 1, nombre: 'Erick', email: 'erick@example.com', rol: 'admin', fecha_ingreso: null },
    { id: 2, nombre: 'Ana', email: 'ana@example.com', rol: 'member', fecha_ingreso: null },
  ],
};

const expense: SharedExpense = {
  id: 9,
  grupo_id: 5,
  usuario_id: 1,
  monto: '1000.00',
  descripcion: 'Cena',
  fecha: '2026-11-07',
  participantes: [1, 2],
};

const authValue: AuthContextValue = {
  user: { id: 1, nombre: 'Erick', email: 'erick@example.com' },
  status: 'authenticated',
  login: async () => undefined,
  register: async () => undefined,
  updateProfile: async () => undefined,
  changePassword: async () => undefined,
  logout: async () => undefined,
};

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

function renderDetalle(path = '/grupos/5') {
  window.history.replaceState({}, '', path);

  return render(
    <AuthContext.Provider value={authValue}>
      <IonApp>
        <IonReactRouter>
          <Routes>
            <Route path="/grupos/:id" element={<GrupoDetalle />} />
            <Route path="/grupos/:id/gastos/nuevo" element={<div>Nuevo gasto</div>} />
            <Route path="/gastos-compartidos/:id" element={<div>Detalle del gasto</div>} />
          </Routes>
        </IonReactRouter>
      </IonApp>
    </AuthContext.Provider>,
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

describe('GrupoDetalle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchGroupMock.mockResolvedValue(group);
    addMemberMock.mockResolvedValue(group);
    fetchExpensesMock.mockResolvedValue(page([expense]));
  });

  it('muestra integrantes, gastos y navega al detalle del gasto', async () => {
    renderDetalle();

    expect(await screen.findByRole('heading', { name: 'Apartamento 301' })).toBeInTheDocument();
    expect(screen.getByText('Erick')).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Anfitrión')).toBeInTheDocument();
    expect(screen.getByText('Miembro')).toBeInTheDocument();

    expect(await screen.findByText('Cena')).toBeInTheDocument();
    expect(screen.getByText('$ 1000.00')).toBeInTheDocument();
    expect(screen.getByText(/Erick · 07 nov 2026 · 2 participantes/)).toBeInTheDocument();
    expect(fetchExpensesMock).toHaveBeenCalledWith(5, 1, 20);

    fireEvent.click(screen.getByTestId('gasto-9'));

    expect(await screen.findByText('Detalle del gasto')).toBeInTheDocument();
  });

  it('agrega un integrante por correo y recarga el grupo', async () => {
    const updated: Group = {
      ...group,
      miembros: [
        ...(group.miembros ?? []),
        { id: 3, nombre: 'Luis', email: 'luis@example.com', rol: 'member', fecha_ingreso: null },
      ],
    };
    fetchGroupMock.mockResolvedValueOnce(group).mockResolvedValueOnce(updated);

    renderDetalle();

    await screen.findByRole('heading', { name: 'Apartamento 301' });
    setInput('grupo-email', 'luis@example.com');
    fireEvent.submit(screen.getByRole('form', { name: 'Agregar integrante' }));

    expect(await screen.findByText('Luis')).toBeInTheDocument();
    expect(addMemberMock).toHaveBeenCalledWith(5, 'luis@example.com');
    expect(fetchGroupMock).toHaveBeenCalledTimes(2);
  });

  it('navega al formulario de alta de gasto', async () => {
    renderDetalle();

    await screen.findByText('Cena');
    fireEvent.click(screen.getByLabelText('Registrar gasto compartido'));

    expect(await screen.findByText('Nuevo gasto')).toBeInTheDocument();
  });

  it('rechaza un identificador inválido sin llamar a la API', async () => {
    renderDetalle('/grupos/abc');

    expect(await screen.findByText('El grupo solicitado no es válido.')).toBeInTheDocument();
    expect(fetchGroupMock).not.toHaveBeenCalled();
    expect(fetchExpensesMock).not.toHaveBeenCalled();
  });
});
