import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../lib/apiClient';
import { tokenStore } from '../lib/secureStorage';

import { useAuth, type AuthUser, type RegisterPayload } from './AuthContext';
import { AuthProvider } from './AuthProvider';

vi.mock('../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    setUnauthorizedHandler: vi.fn(),
  },
}));

vi.mock('../lib/secureStorage', () => ({
  tokenStore: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
}));

const user: AuthUser = {
  id: 1,
  nombre: 'Ana',
  email: 'ana@example.com',
};

const registerPayload: RegisterPayload = {
  name: 'Ana',
  email: 'ana@example.com',
  password: 'secret123',
  password_confirmation: 'secret123',
};

const getRequest = vi.mocked(apiClient.get);
const postRequest = vi.mocked(apiClient.post);
const setUnauthorizedHandler = vi.mocked(apiClient.setUnauthorizedHandler);
const getToken = vi.mocked(tokenStore.get);
const setToken = vi.mocked(tokenStore.set);
const clearToken = vi.mocked(tokenStore.clear);

function SessionProbe() {
  const { status, user: currentUser, login, register, logout } = useAuth();

  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="user">{currentUser?.nombre ?? ''}</span>
      <button onClick={() => void login({ email: 'ana@example.com', password: 'secret123' })}>Entrar</button>
      <button onClick={() => void register(registerPayload)}>Registrarse</button>
      <button onClick={() => void logout()}>Salir</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<SessionProbe />} />
          <Route path="/login" element={<div>Pantalla de login</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getToken.mockResolvedValue(null);
    getRequest.mockResolvedValue({ data: user });
    setToken.mockResolvedValue();
    clearToken.mockResolvedValue();
    postRequest.mockResolvedValue({ user, token: 'token-nuevo' });
  });

  it('restaura la sesión si hay token guardado', async () => {
    getToken.mockResolvedValue('token-guardado');
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
    });

    expect(getRequest).toHaveBeenCalledWith('/user');
    expect(screen.getByTestId('user')).toHaveTextContent('Ana');
  });

  it('queda como invitado si no hay token', async () => {
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('guest');
    });

    expect(getRequest).not.toHaveBeenCalled();
  });

  it('queda como invitado si el token ya no es válido', async () => {
    getToken.mockResolvedValue('token-expirado');
    getRequest.mockRejectedValue(new Error('401'));

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('guest');
    });
  });

  it('inicia sesión con credenciales y guarda el token', async () => {
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('guest');
    });

    fireEvent.click(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
    });

    expect(postRequest).toHaveBeenCalledWith(
      '/login',
      { email: 'ana@example.com', password: 'secret123' },
      { auth: false },
    );
    expect(setToken).toHaveBeenCalledWith('token-nuevo');
    expect(screen.getByTestId('user')).toHaveTextContent('Ana');
  });

  it('registra la cuenta y guarda el token', async () => {
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('guest');
    });

    fireEvent.click(screen.getByText('Registrarse'));

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
    });

    expect(postRequest).toHaveBeenCalledWith('/register', registerPayload, { auth: false });
    expect(setToken).toHaveBeenCalledWith('token-nuevo');
  });

  it('cierra sesión, limpia el token y navega a login', async () => {
    getToken.mockResolvedValue('token-guardado');
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
    });

    fireEvent.click(screen.getByText('Salir'));

    await waitFor(() => {
      expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    });

    expect(postRequest).toHaveBeenCalledWith('/logout');
    expect(clearToken).toHaveBeenCalled();
  });

  it('registra el manejador de 401 y navega a login', async () => {
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('guest');
    });

    const handler = setUnauthorizedHandler.mock.calls.find(([value]) => typeof value === 'function')?.[0];

    expect(handler).toBeTypeOf('function');

    await act(async () => {
      await handler?.();
    });

    await waitFor(() => {
      expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    });
  });
});
