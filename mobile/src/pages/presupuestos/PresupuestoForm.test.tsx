import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../lib/apiClient';
import { createBudget, type Budget } from '../../lib/budgets';
import type * as BudgetsModule from '../../lib/budgets';
import { fetchAllCategories, type Category } from '../../lib/categories';

import PresupuestoForm from './PresupuestoForm';

vi.mock('../../lib/categories', () => ({
  fetchAllCategories: vi.fn(),
}));

vi.mock('../../lib/budgets', async () => {
  const actual = await vi.importActual<typeof BudgetsModule>('../../lib/budgets');

  return {
    ...actual,
    createBudget: vi.fn(),
  };
});

const fetchCategoriesMock = vi.mocked(fetchAllCategories);
const createBudgetMock = vi.mocked(createBudget);

const categories: Category[] = [{ id: 3, user_id: 1, nombre: 'Comida', tipo: 'gasto' }];

const budget: Budget = {
  id: 12,
  user_id: 1,
  categoria_id: 3,
  nombre: 'Comida',
  monto_maximo: '2500.00',
  mes: 11,
  año: 2026,
};

function renderForm() {
  window.history.replaceState({}, '', '/presupuestos/nuevo');

  return render(
    <IonApp>
      <IonReactRouter>
        <Routes>
          <Route path="/presupuestos/nuevo" element={<PresupuestoForm />} />
          <Route path="/cuentas" element={<div>Lista de cuentas</div>} />
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
  fireEvent.submit(screen.getByRole('form', { name: 'Formulario de presupuesto' }));
}

describe('PresupuestoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchCategoriesMock.mockResolvedValue(categories);
    createBudgetMock.mockResolvedValue(budget);
  });

  it('crea un presupuesto para el mes actual y vuelve a cuentas', async () => {
    const now = new Date();
    renderForm();

    await screen.findByTestId('presupuesto-nombre');
    setInput('presupuesto-nombre', 'Comida');
    setSelect('presupuesto-categoria', '3');
    setInput('presupuesto-monto', '2500');
    submitForm();

    expect(await screen.findByText('Lista de cuentas')).toBeInTheDocument();
    expect(createBudgetMock).toHaveBeenCalledWith({
      category_id: 3,
      name: 'Comida',
      maxAmount: 2500,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });
  });

  it('valida los campos obligatorios antes de enviar', async () => {
    renderForm();

    await screen.findByTestId('presupuesto-nombre');
    submitForm();

    expect(await screen.findByText('El nombre del presupuesto es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('La categoría es obligatoria.')).toBeInTheDocument();
    expect(screen.getByText('El monto máximo del presupuesto es obligatorio.')).toBeInTheDocument();
    expect(createBudgetMock).not.toHaveBeenCalled();
  });

  it('rechaza un período pasado desde el formulario', async () => {
    renderForm();

    await screen.findByTestId('presupuesto-nombre');
    setInput('presupuesto-nombre', 'Comida');
    setSelect('presupuesto-categoria', '3');
    setInput('presupuesto-monto', '2500');
    setSelect('presupuesto-mes', '1');
    setInput('presupuesto-anio', '2020');
    submitForm();

    expect(
      await screen.findByText('No se puede crear un presupuesto para un período que ya pasó.'),
    ).toBeInTheDocument();
    expect(createBudgetMock).not.toHaveBeenCalled();
  });

  it('muestra los errores de validación devueltos por el API', async () => {
    createBudgetMock.mockRejectedValueOnce(
      new ApiError(
        422,
        'VALIDACION_FALLIDA',
        'Revisa los datos enviados.',
        { maxAmount: ['Supera el monto permitido.'], category_id: ['La categoría no existe.'] },
        {},
      ),
    );

    renderForm();

    setInput('presupuesto-nombre', 'Comida');
    setSelect('presupuesto-categoria', '3');
    setInput('presupuesto-monto', '2500');
    submitForm();

    expect(await screen.findByText('Supera el monto permitido.')).toBeInTheDocument();
    expect(screen.getByText('La categoría no existe.')).toBeInTheDocument();
    expect(screen.getByText('Revisa los datos enviados.')).toBeInTheDocument();
  });
});
