import { apiClient, ApiError } from './apiClient';
import type { PaginatedResponse } from './pagination';

export const GROUP_ROLES = ['admin', 'member'] as const;

export type GroupRole = (typeof GROUP_ROLES)[number];

export interface GroupMember {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  fecha_ingreso: string | null;
}

export interface Group {
  id: number;
  nombre: string;
  creada?: string | null;
  actualizada?: string | null;
  miembros?: GroupMember[];
}

export interface GroupPayload {
  name: string;
}

export interface GroupFormValues {
  name: string;
}

export type GroupFormErrors = Record<string, string>;

const GROUP_FIELD_MAP: Record<string, keyof GroupFormValues> = {
  name: 'name',
};

const NAME_MAX_LENGTH = 100;

const GROUP_ROLE_LABELS: Record<GroupRole, string> = {
  admin: 'Anfitrión',
  member: 'Miembro',
};

export function isGroupRole(value: string): value is GroupRole {
  return (GROUP_ROLES as readonly string[]).includes(value);
}

export function groupRoleLabel(role: string): string {
  return isGroupRole(role) ? GROUP_ROLE_LABELS[role] : role;
}

export function groupMemberName(group: Group, userId: number): string {
  return group.miembros?.find((member) => member.id === userId)?.nombre ?? `Usuario #${userId}`;
}

export function isGroupAdmin(group: Group, userId: number): boolean {
  return group.miembros?.some((member) => member.id === userId && member.rol === 'admin') ?? false;
}

export function emptyGroupForm(): GroupFormValues {
  return {
    name: '',
  };
}

export function buildGroupPayload(values: GroupFormValues): GroupPayload {
  return {
    name: values.name.trim(),
  };
}

export function validateGroupForm(values: GroupFormValues): GroupFormErrors {
  const errors: GroupFormErrors = {};
  const name = values.name.trim();

  if (!name) {
    errors.name = 'El nombre del grupo es obligatorio.';
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `El nombre del grupo no puede superar los ${NAME_MAX_LENGTH} caracteres.`;
  }

  return errors;
}

export function toGroupFieldErrors(error: ApiError): GroupFormErrors {
  const errors: GroupFormErrors = {};

  for (const [field, messages] of Object.entries(error.errors)) {
    const mappedField = GROUP_FIELD_MAP[field];
    const message = messages[0];

    if (mappedField && message) {
      errors[mappedField] = message;
    }
  }

  return errors;
}

export function getGroupErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

export function fetchGroupsPage(page = 1, perPage = 20): Promise<PaginatedResponse<Group>> {
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    sort_by: 'name',
    sort_dir: 'asc',
  });

  return apiClient.get<PaginatedResponse<Group>>(`/groups?${query.toString()}`);
}

export async function fetchGroup(id: number): Promise<Group> {
  const response = await apiClient.get<{ data: Group }>(`/groups/${id}`);

  return response.data;
}

export async function createGroup(payload: GroupPayload): Promise<Group> {
  const response = await apiClient.post<{ data: Group }>('/groups', payload);

  return response.data;
}

export async function addGroupMember(groupId: number, email: string): Promise<Group> {
  const response = await apiClient.post<{ data: Group }>(`/groups/${groupId}/members`, {
    email: email.trim(),
  });

  return response.data;
}
