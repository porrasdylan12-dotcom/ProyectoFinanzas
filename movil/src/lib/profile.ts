import type { AuthUser, PasswordPayload, ProfilePayload } from '../auth/AuthContext';

import { apiClient, ApiError } from './apiClient';

export interface ProfileFormValues {
  name: string;
  email: string;
}

export interface PasswordFormValues {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}

export type ProfileFormErrors = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX_LENGTH = 255;
const EMAIL_MAX_LENGTH = 255;
const PASSWORD_MIN_LENGTH = 8;

const PROFILE_FIELD_MAP: Record<string, keyof ProfileFormValues> = {
  name: 'name',
  email: 'email',
};

const PASSWORD_FIELD_MAP: Record<string, keyof PasswordFormValues> = {
  current_password: 'currentPassword',
  password: 'password',
  password_confirmation: 'passwordConfirmation',
};

export function profileFormFromUser(user: AuthUser): ProfileFormValues {
  return {
    name: user.nombre,
    email: user.email,
  };
}

export function emptyPasswordForm(): PasswordFormValues {
  return {
    currentPassword: '',
    password: '',
    passwordConfirmation: '',
  };
}

export function buildProfilePayload(values: ProfileFormValues): ProfilePayload {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
  };
}

export function buildPasswordPayload(values: PasswordFormValues): PasswordPayload {
  return {
    current_password: values.currentPassword,
    password: values.password,
    password_confirmation: values.passwordConfirmation,
  };
}

export function validateProfileForm(values: ProfileFormValues): ProfileFormErrors {
  const errors: ProfileFormErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();

  if (!name) {
    errors.name = 'El nombre es obligatorio.';
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `El nombre no puede superar los ${NAME_MAX_LENGTH} caracteres.`;
  }

  if (!email) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (email.length > EMAIL_MAX_LENGTH) {
    errors.email = `El correo electrónico no puede superar los ${EMAIL_MAX_LENGTH} caracteres.`;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Introduce un correo electrónico válido.';
  }

  return errors;
}

export function validatePasswordForm(values: PasswordFormValues): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  if (!values.currentPassword) {
    errors.currentPassword = 'Escribe tu contraseña actual.';
  }

  if (!values.password) {
    errors.password = 'La nueva contraseña es obligatoria.';
  } else if (values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }

  if (!values.passwordConfirmation) {
    errors.passwordConfirmation = 'Confirma tu nueva contraseña.';
  } else if (values.password !== values.passwordConfirmation) {
    errors.passwordConfirmation = 'Las contraseñas no coinciden.';
  }

  return errors;
}

export function toProfileFieldErrors(error: ApiError): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  for (const [field, messages] of Object.entries(error.errors)) {
    const mappedField = PROFILE_FIELD_MAP[field];
    const message = messages[0];

    if (mappedField && message) {
      errors[mappedField] = message;
    }
  }

  return errors;
}

export function toPasswordFieldErrors(error: ApiError): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  for (const [field, messages] of Object.entries(error.errors)) {
    const mappedField = PASSWORD_FIELD_MAP[field];
    const message = messages[0];

    if (mappedField && message) {
      errors[mappedField] = message;
    }
  }

  return errors;
}

export function getProfileErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

export async function updateMyProfile(payload: ProfilePayload): Promise<AuthUser> {
  const response = await apiClient.patch<{ data: AuthUser }>('/user', payload);

  return response.data;
}

export async function updateMyPassword(payload: PasswordPayload): Promise<void> {
  await apiClient.put<{ message: string }>('/user/password', payload);
}
