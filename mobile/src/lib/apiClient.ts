import { tokenStore, type TokenStore } from './secureStorage';

export type FieldErrors = Record<string, string[]>;

type JsonObject = Record<string, unknown>;
type UnauthorizedHandler = () => void | Promise<void>;

const STATUS_MESSAGES: Record<number, string> = {
  400: 'La solicitud no es válida.',
  401: 'Tu sesión expiró. Inicia sesión de nuevo.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'La operación entra en conflicto con el estado actual.',
  422: 'Revisa los datos enviados.',
  500: 'Ocurrió un error en el servidor.',
};

const NETWORK_ERROR_MESSAGE = 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.';

const MISSING_BASE_URL_MESSAGE = 'Falta configurar VITE_API_BASE_URL en el archivo .env del proyecto móvil.';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly errors: FieldErrors;
  readonly data: JsonObject;

  constructor(status: number, code: string, message: string, errors: FieldErrors = {}, data: JsonObject = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.data = data;
  }

  get isNetworkError(): boolean {
    return this.status === 0 && this.code === 'NETWORK_ERROR';
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: HeadersInit;
  /** Adjunta el token almacenado. Se desactiva en login y registro. */
  auth?: boolean;
}

export interface ApiClientOptions {
  baseUrl?: string;
  tokenStore?: TokenStore;
  fetchFn?: typeof fetch;
}

function isRecord(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readJson(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function readErrors(payload: JsonObject | null): FieldErrors {
  const errors = payload?.errors;
  if (!isRecord(errors)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(errors)
      .filter(([, value]) => Array.isArray(value))
      .map(([field, value]) => [field, (value as unknown[]).map(String)]),
  );
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly tokens: TokenStore;
  private readonly fetchFn: typeof fetch;
  private unauthorizedHandler: UnauthorizedHandler | null = null;

  constructor({
    baseUrl = import.meta.env.VITE_API_BASE_URL ?? '',
    tokenStore: tokens = tokenStore,
    fetchFn = (...args) => globalThis.fetch(...args),
  }: ApiClientOptions = {}) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.tokens = tokens;
    this.fetchFn = fetchFn;
  }

  /**
   * Registra la acción a ejecutar cuando una petición autenticada recibe 401.
   * El contexto de sesión la usa para limpiar el estado y navegar a Login.
   */
  setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
    this.unauthorizedHandler = handler;
  }

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    if (!this.baseUrl) {
      throw new ApiError(0, 'CONFIG_ERROR', MISSING_BASE_URL_MESSAGE);
    }

    const { body, auth = true, headers, ...init } = options;
    const token = auth ? await this.tokens.get() : null;
    const requestHeaders = new Headers(headers);

    requestHeaders.set('Accept', 'application/json');
    if (body !== undefined) {
      requestHeaders.set('Content-Type', 'application/json');
    }
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    let response: Response;
    try {
      response = await this.fetchFn(`${this.baseUrl}${normalizePath(path)}`, {
        ...init,
        headers: requestHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(0, 'NETWORK_ERROR', NETWORK_ERROR_MESSAGE);
    }

    const rawPayload = await readJson(response);
    const payload = isRecord(rawPayload) ? rawPayload : null;

    if (response.status === 401 && token) {
      await this.tokens.clear();
      await this.unauthorizedHandler?.();
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        typeof payload?.code === 'string' ? payload.code : `HTTP_${response.status}`,
        typeof payload?.message === 'string'
          ? payload.message
          : (STATUS_MESSAGES[response.status] ?? 'Ocurrió un error inesperado.'),
        readErrors(payload),
        payload ?? {},
      );
    }

    return rawPayload as T;
  }

  get<T>(path: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  patch<T>(path: string, body?: unknown, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  delete<T>(path: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
