import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '../../auth/AuthContext';
import { apiClient, ApiError } from '../../lib/apiClient';

import ForgotPassword from './ForgotPassword';
import Login from './Login';
import Register from './Register';

vi.mock('../../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../lib/apiClient', async () => {
  const actual = await vi.importActual<typeof import('../../lib/apiClient')>('../../lib/apiClient');

  return {
    ...actual,
    apiClient: {
      post: vi.fn(),
    },
  };
});

const login = vi.fn<() => Promise<void>>();
const register = vi.fn<() => Promise<void>>();
const postRequest = vi.mocked(apiClient.post);
const useAuthMock = vi.mocked(useAuth);

function fillInput(testId: string, value: string): void {
  fireEvent(screen.getByTestId(testId), new CustomEvent('ionInput', { detail: { value } }));
}

function submitForm(name: RegExp): void {
  fireEvent.submit(screen.getByRole('form', { name }));
}

function renderPage(page: ReactElement) {
  return render(<MemoryRouter>{page}</MemoryRouter>);
}

beforeEach(() => {
  vi.clearAllMocks();
  login.mockResolvedValue();
  register.mockResolvedValue();
  useAuthMock.mockReturnValue({
    user: null,
    status: 'guest',
    login,
    register,
    logout: vi.fn(),
  });
});

describe('Login', () => {
  it('no envía el formulario si faltan datos', () => {
    renderPage(<Login />);

    submitForm(/inicio de sesión/i);

    expect(login).not.toHaveBeenCalled();
  });

  it('envía las credenciales sin espacios sobrantes', async () => {
    renderPage(<Login />);

    fillInput('login-email', '  ana@example.com ');
    fillInput('login-password', 'secret123');
    submitForm(/inicio de sesión/i);

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'secret123' });
    });
  });

  it('muestra el mensaje de error de la API', async () => {
    login.mockRejectedValue(
      new ApiError(401, 'CREDENCIALES_INVALIDAS', 'Credenciales inválidas.'),
    );
    renderPage(<Login />);

    fillInput('login-email', 'ana@example.com');
    fillInput('login-password', 'incorrecta');
    submitForm(/inicio de sesión/i);

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas.');
  });
});

describe('Register', () => {
  it('envía el payload con la confirmación de contraseña', async () => {
    renderPage(<Register />);

    fillInput('register-name', '  Ana Pérez ');
    fillInput('register-email', 'ana@example.com');
    fillInput('register-password', 'secret123');
    fillInput('register-password-confirmation', 'secret123');
    submitForm(/formulario de registro/i);

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        name: 'Ana Pérez',
        email: 'ana@example.com',
        password: 'secret123',
        password_confirmation: 'secret123',
      });
    });
  });

  it('no envía el formulario si las contraseñas no coinciden', () => {
    renderPage(<Register />);

    fillInput('register-name', 'Ana');
    fillInput('register-email', 'ana@example.com');
    fillInput('register-password', 'secret123');
    fillInput('register-password-confirmation', 'secret124');
    submitForm(/formulario de registro/i);

    expect(register).not.toHaveBeenCalled();
  });
});

describe('ForgotPassword', () => {
  it('muestra la confirmación del servidor', async () => {
    postRequest.mockResolvedValue({ message: 'Te enviamos un enlace de recuperación.' });
    renderPage(<ForgotPassword />);

    fillInput('forgot-email', 'ana@example.com');
    submitForm(/recuperación de contraseña/i);

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Te enviamos un enlace de recuperación.',
    );
    expect(postRequest).toHaveBeenCalledWith(
      '/forgot-password',
      { email: 'ana@example.com' },
      { auth: false },
    );
  });

  it('muestra el error cuando la API falla', async () => {
    postRequest.mockRejectedValue(new ApiError(422, 'DATOS_INVALIDOS', 'Correo no registrado.'));
    renderPage(<ForgotPassword />);

    fillInput('forgot-email', 'ana@example.com');
    submitForm(/recuperación de contraseña/i);

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo no registrado.');
  });
});
