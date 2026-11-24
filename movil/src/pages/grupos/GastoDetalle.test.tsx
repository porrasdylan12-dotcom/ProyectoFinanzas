import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { settleGroupDebt, type GroupDebt } from '../../lib/groupDebts';
import type * as GroupDebtsModule from '../../lib/groupDebts';
import { fetchGroup, type Group } from '../../lib/groups';
import type * as GroupsModule from '../../lib/groups';
import { fetchSharedExpense, type SharedExpense } from '../../lib/sharedExpenses';
import type * as SharedExpensesModule from '../../lib/sharedExpenses';

import GastoDetalle from './GastoDetalle';

vi.mock('../../lib/groups', async () => {
  const actual = await vi.importActual<typeof GroupsModule>('../../lib/groups');

  return {
    ...actual,
    fetchGroup: vi.fn(),
  };
});

vi.mock('../../lib/groupDebts', async () => {
  const actual = await vi.importActual<typeof GroupDebtsModule>('../../lib/groupDebts');

  return {
    ...actual,
    settleGroupDebt: vi.fn(),
  };
});

vi.mock('../../lib/sharedExpenses', async () => {
  const actual = await vi.importActual<typeof SharedExpensesModule>('../../lib/sharedExpenses');

  return {
    ...actual,
    fetchSharedExpense: vi.fn(),
  };
});

const fetchGroupMock = vi.mocked(fetchGroup);
const fetchExpenseMock = vi.mocked(fetchSharedExpense);
const settleDebtMock = vi.mocked(settleGroupDebt);

const group: Group = {
  id: 5,
  nombre: 'Apartamento 301',
  miembros: [
    { id: 1, nombre: 'Erick', email: 'erick@example.com', rol: 'admin', fecha_ingreso: null },
    { id: 2, nombre: 'Ana', email: 'ana@example.com', rol: 'member', fecha_ingreso: null },
  ],
};

const debt: GroupDebt = {
  id: 11,
  gasto_compartido_id: 9,
  deudor_id: 2,
  acreedor_id: 1,
  monto_total: '500.00',
  estado: 'pending',
};

const expense: SharedExpense = {
  id: 9,
  grupo_id: 5,
  usuario_id: 1,
  monto: '1000.00',
  descripcion: 'Cena',
  fecha: '2026-11-07',
  participantes: [1, 2],
  deudas: [debt],
};

function renderDetalle(path = '/gastos-compartidos/9') {
  window.history.replaceState({}, '', path);

  return render(
    <IonApp>
      <IonReactRouter>
        <Routes>
          <Route path="/gastos-compartidos/:id" element={<GastoDetalle />} />
          <Route path="/grupos/:id" element={<div>Detalle del grupo</div>} />
        </Routes>
      </IonReactRouter>
    </IonApp>,
  );
}

describe('GastoDetalle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchGroupMock.mockResolvedValue(group);
    fetchExpenseMock.mockResolvedValue(expense);
    settleDebtMock.mockResolvedValue({ ...debt, estado: 'paid' });
  });

  it('muestra el gasto y sus deudas', async () => {
    renderDetalle();

    expect(await screen.findByRole('heading', { name: 'Cena' })).toBeInTheDocument();
    expect(screen.getByTestId('gasto-total')).toHaveTextContent('$ 1000.00');
    expect(screen.getByText(/Pagó: Erick/)).toBeInTheDocument();
    expect(screen.getByText(/Participantes: Erick, Ana/)).toBeInTheDocument();
    expect(screen.getByText('Ana debe a Erick')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('$ 500.00')).toBeInTheDocument();
    expect(fetchExpenseMock).toHaveBeenCalledWith(9);
    expect(fetchGroupMock).toHaveBeenCalledWith(5);
  });

  it('saldar una deuda la vuelve a cargar como pagada', async () => {
    fetchExpenseMock
      .mockResolvedValueOnce(expense)
      .mockResolvedValueOnce({ ...expense, deudas: [{ ...debt, estado: 'paid' }] });

    renderDetalle();

    fireEvent.click(await screen.findByTestId('saldar-deuda-11'));

    expect(await screen.findByText('Pagada')).toBeInTheDocument();
    expect(settleDebtMock).toHaveBeenCalledWith(debt);
    expect(fetchExpenseMock).toHaveBeenCalledTimes(2);
    expect(screen.queryByTestId('saldar-deuda-11')).not.toBeInTheDocument();
  });

  it('muestra el error inicial y permite reintentar', async () => {
    fetchExpenseMock.mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce(expense);

    renderDetalle();

    expect(await screen.findByText('Sin conexión')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Reintentar'));

    expect(await screen.findByRole('heading', { name: 'Cena' })).toBeInTheDocument();
    expect(fetchExpenseMock).toHaveBeenCalledTimes(2);
  });

  it('rechaza un identificador inválido sin llamar a la API', async () => {
    renderDetalle('/gastos-compartidos/abc');

    expect(await screen.findByText('El gasto compartido solicitado no es válido.')).toBeInTheDocument();
    expect(fetchExpenseMock).not.toHaveBeenCalled();
    expect(fetchGroupMock).not.toHaveBeenCalled();
  });
});
