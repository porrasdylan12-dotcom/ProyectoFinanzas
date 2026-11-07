import { ApiError } from '../../lib/apiClient';

export type FormErrors = Record<string, string>;

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const value = email.trim();

  if (!value) {
    return 'El correo electrónico es obligatorio.';
  }

  if (!EMAIL_PATTERN.test(value)) {
    return 'Introduce un correo electrónico válido.';
  }

  return null;
}

export function buildLoginCredentials({ email, password }: LoginFormValues): LoginFormValues {
  return { email: email.trim(), password };
}

export function buildRegisterPayload(values: RegisterFormValues): {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
} {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    password: values.password,
    password_confirmation: values.passwordConfirmation,
  };
}

export function validateLoginForm({ email, password }: LoginFormValues): FormErrors {
  const errors: FormErrors = {};
  const emailError = validateEmail(email);

  if (emailError) {
    errors.email = emailError;
  }

  if (!password) {
    errors.password = 'La contraseña es obligatoria.';
  }

  return errors;
}

export function validateRegisterForm(values: RegisterFormValues): FormErrors {
  const errors: FormErrors = {};
  const emailError = validateEmail(values.email);

  if (!values.name.trim()) {
    errors.name = 'El nombre es obligatorio.';
  } else if (values.name.trim().length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres.';
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (!values.password) {
    errors.password = 'La contraseña es obligatoria.';
  } else if (values.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.';
  }

  if (!values.passwordConfirmation) {
    errors.password_confirmation = 'Confirma tu contraseña.';
  } else if (values.password !== values.passwordConfirmation) {
    errors.password_confirmation = 'Las contraseñas no coinciden.';
  }

  return errors;
}

export function validateForgotPasswordForm(email: string): FormErrors {
  const errors: FormErrors = {};
  const emailError = validateEmail(email);

  if (emailError) {
    errors.email = emailError;
  }

  return errors;
}

export function toFieldErrors(error: ApiError): FormErrors {
  return Object.fromEntries(
    Object.entries(error.errors)
      .map(([field, messages]) => [field, messages[0] ?? ''])
      .filter(([, message]) => message !== ''),
  );
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
