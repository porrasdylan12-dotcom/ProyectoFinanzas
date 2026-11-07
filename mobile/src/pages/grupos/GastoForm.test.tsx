import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes, useParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext, type AuthContextValue } from '../../auth/AuthContext';
import { ApiError } from '../../lib/apiClient';
import { fetchGroup, type Group } from '../../lib/groups';
import { createSharedExpense, todaySharedExpenseDate, type SharedExpense } from '../../lib/sharedExpenses';
import type * as SharedExpensesModule from '../../lib/sharedExpenses';

import GastoForm from './GastoForm';

vi.mock('../../lib/groups', () => ({
  fetchGroup: vi.fn(),
}));

vi.mock('../../lib/sharedExpenses', async () => {
  const actual = await vi.importActual<typeof SharedExpensesModule>('../../lib/sharedExpenses');

  return {
    ...actual,
    createSharedExpense: vi.fn(),
  };
});

const fetchGroupMock = vi.mocked(fetchGroup);
const createExpenseMock = vi.mocked(createSharedExpense);

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
  logout: async () => undefined,
};

const DetalleMarker: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return <div>Gasto {id}</div>;
};

function renderForm() {
  window.history.replaceState({}, '', '/grupos/5/gastos/nuevo');

  return render(
    <AuthContext.Provider value={authValue}>
      <IonApp>
        <IonReactRouter>
          <Routes>
            <Route path="/grupos/:id/gastos/nuevo" element={<GastoForm />} />
            <Route path="/gastos-compartidos/:id" element={<DetalleMarker />} />
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

function toggleParticipant(testId: string, checked: boolean): void {
  fireEvent(
    screen.getByTestId(testId),
    new CustomEvent('ionChange', {
      detail: { checked },
      bubbles: true,
    }),
  );
}

function submitForm(): void {
  fireEvent.submit(screen.getByRole('form', { name: 'Formulario de gasto compartido' }));
}

describe('GastoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchGroupMock.mockResolvedValue(group);
    createExpenseMock.mockResolvedValue(expense);
  });

  it('registra un gasto con todos los integrantes y navega a su detalle', async () => {
    renderForm();

    expect(await screen.findByText(/Grupo: Apartamento 301 · Paga: Erick/)).toBeInTheDocument();
    expect(screen.getByText('ana@example.com')).toBeInTheDocument();

    setInput('gasto-monto', '1000');
    setInput('gasto-descripcion', '  Cena  ');
    submitForm();

    expect(await screen.findByText('Gasto 9')).toBeInTheDocument();
    expect(createExpenseMock).toHaveBeenCalledWith(5, {
      amount: 1000,
      description: 'Cena',
      date: todaySharedExpenseDate(),
      participants: [1, 2],
    });
  });

  it('exige monto y al menos dos participantes', async () => {
    renderForm();

    await screen.findByText(/Grupo: Apartamento 301/);
    toggleParticipant('participante-2', false);
    submitForm();

    expect(await screen.findByText('El monto del gasto compartido es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('Debes seleccionar al menos 2 participantes.')).toBeInTheDocument();
    expect(createExpenseMock).not.toHaveBeenCalled();
  });

  it('muestra los errores de validación devueltos por el API', async () => {
    createExpenseMock.mockRejectedValueOnce(
      new ApiError(422, 'VALIDACION_FALLIDA', 'Revisa los datos enviados.', {
        'participants.0': ['Uno de los participantes no existe en el sistema.'],
      }),
    );

    renderForm();

    await screen.findByText(/Grupo: Apartamento 301/);
    setInput('gasto-monto', '100');
    submitForm();

    expect(await screen.findByText('Uno de los participantes no existe en el sistema.')).toBeInTheDocument();
    expect(screen.getByText('Revisa los datos enviados.')).toBeInTheDocument();
  });
});
