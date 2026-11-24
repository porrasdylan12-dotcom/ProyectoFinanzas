import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthUser } from '../auth/AuthContext';

import { ApiError, apiClient } from './apiClient';
import type * as ApiClientModule from './apiClient';
import {
  buildPasswordPayload,
  buildProfilePayload,
  emptyPasswordForm,
  getProfileErrorMessage,
  profileFormFromUser,
  toPasswordFieldErrors,
  toProfileFieldErrors,
  updateMyPassword,
  updateMyProfile,
  validatePasswordForm,
  validateProfileForm,
} from './profile';

vi.mock('./apiClient', async () => {
  const actual = await vi.importActual<typeof ApiClientModule>('./apiClient');

  return {
    ...actual,
    apiClient: {
      patch: vi.fn(),
      put: vi.fn(),
    },
  };
});

const patchRequest = vi.mocked(apiClient.patch);
const putRequest = vi.mocked(apiClient.put);

const user: AuthUser = {
  id: 1,
  nombre: 'Ana',
  email: 'ana@example.com',
};

describe('profileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parte de los datos del usuario y limpia espacios al construir el payload', () => {
    expect(profileFormFromUser(user)).toEqual({ name: 'Ana', email: 'ana@example.com' });
    expect(buildProfilePayload({ name: '  Ana  ', email: ' ana@example.com ' })).toEqual({
      name: 'Ana',
      email: 'ana@example.com',
    });
  });

  it('valida nombre y correo del perfil', () => {
    expect(validateProfileForm({ name: '', email: '' })).toEqual({
      name: 'El nombre es obligatorio.',
      email: 'El correo electrónico es obligatorio.',
    });
    expect(validateProfileForm({ name: 'Ana', email: 'correo-invalido' })).toEqual({
      email: 'Introduce un correo electrónico válido.',
    });
    expect(validateProfileForm({ name: 'Ana', email: 'ana@example.com' })).toEqual({});
  });

  it('mapea los errores de validación del perfil', () => {
    const error = new ApiError(422, 'VALIDACION_FALLIDA', 'Revisa los datos enviados.', {
      name: ['El nombre ya está en uso.'],
      email: ['El correo ya está registrado.'],
    });

    expect(toProfileFieldErrors(error)).toEqual({
      name: 'El nombre ya está en uso.',
      email: 'El correo ya está registrado.',
    });
    expect(getProfileErrorMessage(error)).toBe('Revisa los datos enviados.');
    expect(getProfileErrorMessage(new Error('fallo'))).toBe('Ocurrió un error inesperado. Inténtalo de nuevo.');
  });

  it('actualiza el perfil y devuelve el usuario actualizado', async () => {
    const updated = { ...user, nombre: 'Ana María' };
    patchRequest.mockResolvedValue({ data: updated });

    await expect(updateMyProfile({ name: 'Ana María', email: 'ana@example.com' })).resolves.toEqual(updated);
    expect(patchRequest).toHaveBeenCalledWith('/user', {
      name: 'Ana María',
      email: 'ana@example.com',
    });
  });
});

describe('passwordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('valida la contraseña actual, la nueva y su confirmación', () => {
    expect(validatePasswordForm(emptyPasswordForm())).toEqual({
      currentPassword: 'Escribe tu contraseña actual.',
      password: 'La nueva contraseña es obligatoria.',
      passwordConfirmation: 'Confirma tu nueva contraseña.',
    });
    expect(
      validatePasswordForm({
        currentPassword: 'actual',
        password: 'corta',
        passwordConfirmation: 'otra',
      }),
    ).toEqual({
      password: 'La contraseña debe tener al menos 8 caracteres.',
      passwordConfirmation: 'Las contraseñas no coinciden.',
    });
  });

  it('construye el payload y mapea los errores del API', () => {
    expect(
      buildPasswordPayload({
        currentPassword: 'actual',
        password: 'nueva123',
        passwordConfirmation: 'nueva123',
      }),
    ).toEqual({
      current_password: 'actual',
      password: 'nueva123',
      password_confirmation: 'nueva123',
    });

    const error = new ApiError(422, 'VALIDACION_FALLIDA', 'Revisa los datos enviados.', {
      current_password: ['La contraseña actual no es correcta.'],
      password: ['La contraseña es débil.'],
    });

    expect(toPasswordFieldErrors(error)).toEqual({
      currentPassword: 'La contraseña actual no es correcta.',
      password: 'La contraseña es débil.',
    });
  });

  it('envía el cambio de contraseña con PUT', async () => {
    putRequest.mockResolvedValue({ message: 'Contraseña actualizada correctamente.' });

    await updateMyPassword({
      current_password: 'actual',
      password: 'nueva123',
      password_confirmation: 'nueva123',
    });

    expect(putRequest).toHaveBeenCalledWith('/user/password', {
      current_password: 'actual',
      password: 'nueva123',
      password_confirmation: 'nueva123',
    });
  });
});
