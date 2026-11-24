import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchGroupsPage, type Group } from '../../lib/groups';
import type { PaginatedResponse } from '../../lib/pagination';

import Grupos from './Grupos';

vi.mock('../../lib/groups', () => ({
  fetchGroupsPage: vi.fn(),
}));

const fetchPage = vi.mocked(fetchGroupsPage);

const groups: Group[] = [
  {
    id: 5,
    nombre: 'Apartamento 301',
    miembros: [
      { id: 1, nombre: 'Erick', email: 'erick@example.com', rol: 'admin', fecha_ingreso: null },
      { id: 2, nombre: 'Ana', email: 'ana@example.com', rol: 'member', fecha_ingreso: null },
    ],
  },
  {
    id: 6,
    nombre: 'Viaje',
    miembros: [{ id: 1, nombre: 'Erick', email: 'erick@example.com', rol: 'admin', fecha_ingreso: null }],
  },
];

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

function renderGrupos() {
  window.history.replaceState({}, '', '/grupos');

  return render(
    <IonApp>
      <IonReactRouter>
        <Routes>
          <Route path="/grupos" element={<Grupos />} />
          <Route path="/grupos/nuevo" element={<div>Nuevo grupo</div>} />
          <Route path="/grupos/:id" element={<div>Detalle del grupo</div>} />
        </Routes>
      </IonReactRouter>
    </IonApp>,
  );
}

describe('Grupos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchPage.mockResolvedValue(page(groups));
  });

  it('muestra los grupos con su número de integrantes y navega al detalle', async () => {
    renderGrupos();

    expect(await screen.findByText('Apartamento 301')).toBeInTheDocument();
    expect(screen.getByText('2 integrantes')).toBeInTheDocument();
    expect(screen.getByText('1 integrante')).toBeInTheDocument();
    expect(fetchPage).toHaveBeenCalledWith(1, 20);

    fireEvent.click(screen.getByTestId('grupo-5'));

    expect(await screen.findByText('Detalle del grupo')).toBeInTheDocument();
  });

  it('muestra el estado vacío y permite crear un grupo', async () => {
    fetchPage.mockResolvedValue(page([]));

    renderGrupos();

    expect(await screen.findByText('Aún no tienes grupos.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Crear tu primer grupo'));

    expect(await screen.findByText('Nuevo grupo')).toBeInTheDocument();
  });

  it('muestra el error inicial y permite reintentar', async () => {
    fetchPage.mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce(page(groups));

    renderGrupos();

    expect(await screen.findByText('Sin conexión')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Reintentar'));

    expect(await screen.findByText('Apartamento 301')).toBeInTheDocument();
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it('permite abrir el formulario de alta desde la cabecera', async () => {
    renderGrupos();

    await screen.findByText('Apartamento 301');
    fireEvent.click(screen.getByLabelText('Crear grupo'));

    expect(await screen.findByText('Nuevo grupo')).toBeInTheDocument();
  });
});
