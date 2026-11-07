import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes, useParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../lib/apiClient';
import { createGroup, type Group } from '../../lib/groups';
import type * as GroupsModule from '../../lib/groups';

import GrupoForm from './GrupoForm';

vi.mock('../../lib/groups', async () => {
  const actual = await vi.importActual<typeof GroupsModule>('../../lib/groups');

  return {
    ...actual,
    createGroup: vi.fn(),
  };
});

const createGroupMock = vi.mocked(createGroup);

const group: Group = { id: 5, nombre: 'Apartamento 301' };

const DetalleMarker: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return <div>Detalle {id}</div>;
};

function renderForm() {
  window.history.replaceState({}, '', '/grupos/nuevo');

  return render(
    <IonApp>
      <IonReactRouter>
        <Routes>
          <Route path="/grupos/nuevo" element={<GrupoForm />} />
          <Route path="/grupos/:id" element={<DetalleMarker />} />
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

function submitForm(): void {
  fireEvent.submit(screen.getByRole('form', { name: 'Formulario de grupo' }));
}

describe('GrupoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createGroupMock.mockResolvedValue(group);
  });

  it('crea un grupo y navega a su detalle', async () => {
    renderForm();

    setInput('grupo-nombre', '  Apartamento 301  ');
    submitForm();

    expect(await screen.findByText('Detalle 5')).toBeInTheDocument();
    expect(createGroupMock).toHaveBeenCalledWith({ name: 'Apartamento 301' });
  });

  it('exige el nombre antes de enviar', async () => {
    renderForm();

    submitForm();

    expect(await screen.findByText('El nombre del grupo es obligatorio.')).toBeInTheDocument();
    expect(createGroupMock).not.toHaveBeenCalled();
  });

  it('muestra los errores de validación devueltos por el API', async () => {
    createGroupMock.mockRejectedValueOnce(
      new ApiError(422, 'VALIDACION_FALLIDA', 'Revisa los datos enviados.', {
        name: ['Ya existe un grupo con este nombre.'],
      }),
    );

    renderForm();

    setInput('grupo-nombre', 'Apartamento 301');
    submitForm();

    expect(await screen.findByText('Ya existe un grupo con este nombre.')).toBeInTheDocument();
    expect(screen.getByText('Revisa los datos enviados.')).toBeInTheDocument();
  });
});
