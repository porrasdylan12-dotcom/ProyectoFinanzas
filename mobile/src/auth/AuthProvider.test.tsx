import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as ApiClientModule from '../lib/apiClient';
import { apiClient, ApiError } from '../lib/apiClient';
import type * as OfflineCacheModule from '../lib/offlineCache';
import { SESSION_USER_KEY, clearOfflineCache, readCache, writeCache } from '../lib/offlineCache';
import { tokenStore } from '../lib/secureStorage';

import { useAuth, type AuthUser, type RegisterPayload } from './AuthContext';
import { AuthProvider } from './AuthProvider';

vi.mock('../lib/apiClient', async () => {
  const actual = await vi.importActual<typeof ApiClientModule>('../lib/apiClient');

  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      setUnauthorizedHandler: vi.fn(),
    },
  };
});

vi.mock('../lib/offlineCache', async () => {
  const actual = await vi.importActual<typeof OfflineCacheModule>('../lib/offlineCache');

  return {
    ...actual,
    readCache: vi.fn(),
    writeCache: vi.fn(),
    clearOfflineCache: vi.fn(),
  };
});

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
const patchRequest = vi.mocked(apiClient.patch);
const putRequest = vi.mocked(apiClient.put);
const setUnauthorizedHandler = vi.mocked(apiClient.setUnauthorizedHandler);
const getToken = vi.mocked(tokenStore.get);
const setToken = vi.mocked(tokenStore.set);
const clearToken = vi.mocked(tokenStore.clear);
const readCached = vi.mocked(readCache);
const writeCached = vi.mocked(writeCache);
const clearCache = vi.mocked(clearOfflineCache);

function SessionProbe() {
  const { status, user: currentUser, login, register, updateProfile, changePassword, logout } = useAuth();

  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="user">{currentUser?.nombre ?? ''}</span>
      <button onClick={() => void login({ email: 'ana@example.com', password: 'secret123' })}>Entrar</button>
      <button onClick={() => void register(registerPayload)}>Registrarse</button>
      <button onClick={() => void updateProfile({ name: 'Ana María', email: 'ana@example.com' })}>
        Actualizar perfil
      </button>
      <button
        onClick={() =>
          void changePassword({
            current_password: 'secret123',
            password: 'nueva123',
            password_confirmation: 'nueva123',
          })
        }
      >
        Cambiar contraseña
      </button>
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
    readCached.mockResolvedValue(null);
    writeCached.mockResolvedValue();
    clearCache.mockResolvedValue();
    postRequest.mockResolvedValue({ user, token: 'token-nuevo' });
    patchRequest.mockResolvedValue({ data: { ...user, nombre: 'Ana María' } });
    putRequest.mockResolvedValue({ message: 'Contraseña actualizada correctamente.' });
  });

  it('restaura la sesión si hay token guardado', async () => {
    getToken.mockResolvedValue('token-guardado');
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
    });

    expect(getRequest).toHaveBeenCalledWith('/user');
    expect(writeCached).toHaveBeenCalledWith(SESSION_USER_KEY, user);
    expect(screen.getByTestId('user')).toHaveTextContent('Ana');
  });

  it('restaura la sesión desde la caché si no hay red', async () => {
    getToken.mockResolvedValue('token-guardado');
    getRequest.mockRejectedValue(new ApiError(0, 'NETWORK_ERROR', 'Sin conexión'));
    readCached.mockResolvedValue(user);

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
    });

    expect(readCached).toHaveBeenCalledWith(SESSION_USER_KEY);
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
    expect(clearCache).toHaveBeenCalled();
    expect(writeCached).toHaveBeenCalledWith(SESSION_USER_KEY, user);
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

  it('actualiza el perfil y refleja el nombre en la sesión', async () => {
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('guest');
    });

    fireEvent.click(screen.getByText('Actualizar perfil'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Ana María');
    });

    expect(patchRequest).toHaveBeenCalledWith('/user', {
      name: 'Ana María',
      email: 'ana@example.com',
    });
    expect(writeCached).toHaveBeenCalledWith(SESSION_USER_KEY, {
      ...user,
      nombre: 'Ana María',
    });
  });

  it('cambia la contraseña con el payload completo', async () => {
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('guest');
    });

    fireEvent.click(screen.getByText('Cambiar contraseña'));

    await waitFor(() => {
      expect(putRequest).toHaveBeenCalledWith('/user/password', {
        current_password: 'secret123',
        password: 'nueva123',
        password_confirmation: 'nueva123',
      });
    });
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
    expect(clearCache).toHaveBeenCalled();
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

    expect(clearCache).toHaveBeenCalled();
  });
});
