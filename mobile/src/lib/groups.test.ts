import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient, ApiError } from './apiClient';
import type * as ApiClientModule from './apiClient';
import {
  addGroupMember,
  buildGroupPayload,
  createGroup,
  emptyGroupForm,
  fetchGroup,
  fetchGroupsPage,
  getGroupErrorMessage,
  groupMemberName,
  groupRoleLabel,
  isGroupAdmin,
  toGroupFieldErrors,
  validateGroupForm,
  type Group,
} from './groups';
import type { PaginatedResponse } from './pagination';

vi.mock('./apiClient', async () => {
  const actual = await vi.importActual<typeof ApiClientModule>('./apiClient');

  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

const getRequest = vi.mocked(apiClient.get);
const postRequest = vi.mocked(apiClient.post);

const group: Group = {
  id: 5,
  nombre: 'Apartamento 301',
  miembros: [
    {
      id: 1,
      nombre: 'Erick',
      email: 'erick@example.com',
      rol: 'admin',
      fecha_ingreso: '2026-11-01T00:00:00.000000Z',
    },
    {
      id: 2,
      nombre: 'Ana',
      email: 'ana@example.com',
      rol: 'member',
      fecha_ingreso: '2026-11-02T00:00:00.000000Z',
    },
  ],
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

describe('groups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('valida y construye el formulario de grupo', () => {
    expect(validateGroupForm(emptyGroupForm())).toEqual({
      name: 'El nombre del grupo es obligatorio.',
    });
    expect(validateGroupForm({ name: 'x'.repeat(101) })).toEqual({
      name: 'El nombre del grupo no puede superar los 100 caracteres.',
    });
    expect(validateGroupForm({ name: '  Viaje  ' })).toEqual({});
    expect(buildGroupPayload({ name: '  Viaje  ' })).toEqual({ name: 'Viaje' });
  });

  it('traduce errores del API y reconoce roles y administradores', () => {
    const error = new ApiError(422, 'VALIDACION_FALLIDA', 'Revisa los datos enviados.', {
      name: ['Ya existe un grupo con este nombre.'],
    });

    expect(toGroupFieldErrors(error)).toEqual({ name: 'Ya existe un grupo con este nombre.' });
    expect(getGroupErrorMessage(error)).toBe('Revisa los datos enviados.');
    expect(getGroupErrorMessage(new Error('fallo'))).toBe('Ocurrió un error inesperado. Inténtalo de nuevo.');
    expect(groupRoleLabel('admin')).toBe('Anfitrión');
    expect(groupRoleLabel('member')).toBe('Miembro');
    expect(groupRoleLabel('viewer')).toBe('viewer');
    expect(isGroupAdmin(group, 1)).toBe(true);
    expect(isGroupAdmin(group, 2)).toBe(false);
    expect(groupMemberName(group, 2)).toBe('Ana');
    expect(groupMemberName(group, 99)).toBe('Usuario #99');
  });

  it('consulta, crea y agrega miembros', async () => {
    getRequest.mockResolvedValueOnce(page([group])).mockResolvedValueOnce({ data: group });
    postRequest.mockResolvedValueOnce({ data: group }).mockResolvedValueOnce({ data: group });

    await expect(fetchGroupsPage()).resolves.toEqual(page([group]));
    await expect(fetchGroup(5)).resolves.toEqual(group);
    await expect(createGroup({ name: 'Apartamento 301' })).resolves.toEqual(group);
    await expect(addGroupMember(5, 'ana@example.com')).resolves.toEqual(group);

    expect(getRequest).toHaveBeenNthCalledWith(1, '/groups?page=1&per_page=20&sort_by=name&sort_dir=asc');
    expect(getRequest).toHaveBeenNthCalledWith(2, '/groups/5');
    expect(postRequest).toHaveBeenNthCalledWith(1, '/groups', { name: 'Apartamento 301' });
    expect(postRequest).toHaveBeenNthCalledWith(2, '/groups/5/members', {
      email: 'ana@example.com',
    });
  });
});
