import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClient, ApiError } from './apiClient';
import type { TokenStore } from './secureStorage';

function jsonResponse(body: unknown, status = 200): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  } as Response;
}

function createTokenStore(initialToken: string | null = 'token-123') {
  const store = {
    token: initialToken,
    async get(): Promise<string | null> {
      return store.token;
    },
    async set(token: string): Promise<void> {
      store.token = token;
    },
    async clear(): Promise<void> {
      store.token = null;
    },
  } satisfies TokenStore & { token: string | null };

  return store;
}

function createClient(fetchFn: ReturnType<typeof vi.fn>, options: { token?: string | null; baseUrl?: string } = {}) {
  const tokenStore = createTokenStore(options.token === undefined ? 'token-123' : options.token);

  return {
    tokenStore,
    client: new ApiClient({
      baseUrl: options.baseUrl ?? 'http://localhost:8000/api/',
      tokenStore,
      fetchFn: fetchFn as unknown as typeof fetch,
    }),
  };
}

function getHeader(init: RequestInit | undefined, name: string): string | null {
  return new Headers(init?.headers).get(name);
}

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adjunta el token y normaliza la URL base', async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ data: [] }));
    const { client } = createClient(fetchFn);

    await expect(client.get('/accounts')).resolves.toEqual({ data: [] });

    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:8000/api/accounts');
    expect(getHeader(init, 'Authorization')).toBe('Bearer token-123');
    expect(getHeader(init, 'Accept')).toBe('application/json');
  });

  it('omite el token y serializa el cuerpo en peticiones públicas', async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ token: 'nuevo' }));
    const { client } = createClient(fetchFn, { token: 'token-viejo' });

    await client.post('/login', { email: 'user@example.com' }, { auth: false });

    const [, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(getHeader(init, 'Authorization')).toBeNull();
    expect(getHeader(init, 'Content-Type')).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ email: 'user@example.com' }));
  });

  it('cierra la sesión cuando una petición autenticada recibe 401', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: 'Sesión expirada', code: 'NO_AUTENTICADO' }, 401));
    const { client, tokenStore } = createClient(fetchFn);
    const onUnauthorized = vi.fn();
    client.setUnauthorizedHandler(onUnauthorized);

    await expect(client.get('/accounts')).rejects.toMatchObject({
      status: 401,
      code: 'NO_AUTENTICADO',
      message: 'Sesión expirada',
    });
    expect(tokenStore.token).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('no cierra la sesión ante un 401 sin token (credenciales inválidas)', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: 'Credenciales inválidas', code: 'CREDENCIALES' }, 401));
    const { client } = createClient(fetchFn, { token: null });
    const onUnauthorized = vi.fn();
    client.setUnauthorizedHandler(onUnauthorized);

    await expect(client.post('/login', {})).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('expone los errores de validación de Laravel', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          message: 'Los datos no son válidos.',
          code: 'VALIDACION',
          errors: { email: ['El correo es obligatorio.'] },
        },
        422,
      ),
    );
    const { client } = createClient(fetchFn);

    await expect(client.post('/register', {})).rejects.toMatchObject({
      status: 422,
      code: 'VALIDACION',
      errors: { email: ['El correo es obligatorio.'] },
    });
  });

  it('convierte un fallo de red en un error controlado', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const { client } = createClient(fetchFn);

    await expect(client.get('/accounts')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
    });
  });

  it('exige la URL base configurada', async () => {
    const fetchFn = vi.fn();
    const { client } = createClient(fetchFn, { baseUrl: '' });

    await expect(client.get('/accounts')).rejects.toMatchObject({ code: 'CONFIG_ERROR' });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('devuelve null en respuestas 204', async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(undefined, 204));
    const { client } = createClient(fetchFn);

    await expect(client.delete('/accounts/1')).resolves.toBeNull();
  });
});
