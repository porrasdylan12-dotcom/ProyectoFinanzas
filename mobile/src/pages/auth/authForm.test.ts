import { describe, expect, it } from 'vitest';

import { ApiError } from '../../lib/apiClient';

import {
  getErrorMessage,
  toFieldErrors,
  validateEmail,
  validateForgotPasswordForm,
  validateLoginForm,
  validateRegisterForm,
} from './authForm';

describe('validateEmail', () => {
  it('exige el correo', () => {
    expect(validateEmail('   ')).toBe('El correo electrónico es obligatorio.');
  });

  it('rechaza un formato inválido', () => {
    expect(validateEmail('ana@')).toBe('Introduce un correo electrónico válido.');
  });

  it('acepta un correo válido con espacios', () => {
    expect(validateEmail(' ana@example.com ')).toBeNull();
  });
});

describe('validateLoginForm', () => {
  it('exige correo y contraseña', () => {
    expect(validateLoginForm({ email: '', password: '' })).toEqual({
      email: 'El correo electrónico es obligatorio.',
      password: 'La contraseña es obligatoria.',
    });
  });

  it('no devuelve errores con datos válidos', () => {
    expect(validateLoginForm({ email: 'ana@example.com', password: 'secret123' })).toEqual({});
  });
});

describe('validateRegisterForm', () => {
  it('valida nombre, correo y contraseña', () => {
    expect(
      validateRegisterForm({
        name: 'Al',
        email: 'correo',
        password: 'corta',
        passwordConfirmation: '',
      }),
    ).toEqual({
      name: 'El nombre debe tener al menos 3 caracteres.',
      email: 'Introduce un correo electrónico válido.',
      password: 'La contraseña debe tener al menos 8 caracteres.',
      password_confirmation: 'Confirma tu contraseña.',
    });
  });

  it('detecta contraseñas que no coinciden', () => {
    expect(
      validateRegisterForm({
        name: 'Ana',
        email: 'ana@example.com',
        password: 'secret123',
        passwordConfirmation: 'secret124',
      }),
    ).toEqual({ password_confirmation: 'Las contraseñas no coinciden.' });
  });

  it('no devuelve errores con datos válidos', () => {
    expect(
      validateRegisterForm({
        name: 'Ana',
        email: 'ana@example.com',
        password: 'secret123',
        passwordConfirmation: 'secret123',
      }),
    ).toEqual({});
  });
});

describe('validateForgotPasswordForm', () => {
  it('exige un correo', () => {
    expect(validateForgotPasswordForm('')).toEqual({
      email: 'El correo electrónico es obligatorio.',
    });
  });

  it('no devuelve errores con un correo válido', () => {
    expect(validateForgotPasswordForm('ana@example.com')).toEqual({});
  });
});

describe('errores de API', () => {
  it('toma el primer mensaje de cada campo', () => {
    const error = new ApiError(422, 'DATOS_INVALIDOS', 'Los datos enviados no son válidos.', {
      email: ['El correo ya está registrado.', 'Otro mensaje.'],
      password: ['La contraseña es débil.'],
    });

    expect(toFieldErrors(error)).toEqual({
      email: 'El correo ya está registrado.',
      password: 'La contraseña es débil.',
    });
  });

  it('usa el mensaje del ApiError', () => {
    expect(getErrorMessage(new ApiError(401, 'CREDENCIALES_INVALIDAS', 'Credenciales inválidas.'))).toBe(
      'Credenciales inválidas.',
    );
  });

  it('usa un mensaje genérico para errores desconocidos', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('Ocurrió un error inesperado. Inténtalo de nuevo.');
  });
});
