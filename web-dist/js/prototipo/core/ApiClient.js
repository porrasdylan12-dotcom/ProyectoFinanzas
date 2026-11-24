import { API_BASE_URL, TIMEOUT_MS } from './config.js';

export class ApiError extends Error {
    constructor({
        status = 0,
        code = 'ERROR_DESCONOCIDO',
        message = 'Ocurrió un error inesperado.',
        errors = {},
    } = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.errors = errors;
    }

    get esErrorDeRed() {
        return this.status === 0;
    }

    get esErrorDeValidacion() {
        return this.status === 422;
    }

    tieneErroresDeCampo() {
        return Object.keys(this.errors).length > 0;
    }

    errorDeCampo(campo) {
        const mensajes = this.errors[campo];
        return Array.isArray(mensajes) && mensajes.length > 0
            ? mensajes[0]
            : null;
    }
}

export class ApiClient {
    #baseUrl;
    #token;
    #fetch;
    #timeout;

    constructor({
        baseUrl = API_BASE_URL,
        token = null,
        fetchImpl = null,
        timeout = TIMEOUT_MS,
    } = {}) {
        this.#baseUrl = String(baseUrl).replace(/\/+$/, '');
        this.#token = token;
        this.#fetch = fetchImpl ?? ((input, init) => fetch(input, init));
        this.#timeout = timeout;
    }

    get baseUrl() {
        return this.#baseUrl;
    }

    get token() {
        return this.#token;
    }

    setToken(token) {
        this.#token = token || null;
        return this;
    }

    clearToken() {
        this.#token = null;
        return this;
    }

    tieneToken() {
        return Boolean(this.#token);
    }

    get(path, options = {}) {
        return this.request('GET', path, options);
    }

    post(path, body = null, options = {}) {
        return this.request('POST', path, { ...options, body });
    }

    put(path, body = null, options = {}) {
        return this.request('PUT', path, { ...options, body });
    }

    patch(path, body = null, options = {}) {
        return this.request('PATCH', path, { ...options, body });
    }

    delete(path, options = {}) {
        return this.request('DELETE', path, options);
    }

    async request(
        method,
        path,
        { body = null, query = null, headers = {}, signal = null } = {},
    ) {
        const url = this.#construirUrl(path, query);
        const controller = new AbortController();
        const timeoutId =
            this.#timeout > 0
                ? setTimeout(() => controller.abort(), this.#timeout)
                : null;

        if (signal) {
            signal.addEventListener('abort', () => controller.abort(), {
                once: true,
            });
        }

        const options = {
            method: String(method).toUpperCase(),
            headers: {
                Accept: 'application/json',
                ...(body !== null && body !== undefined
                    ? { 'Content-Type': 'application/json' }
                    : {}),
                ...(this.#token
                    ? { Authorization: `Bearer ${this.#token}` }
                    : {}),
                ...headers,
            },
            signal: controller.signal,
        };

        if (body !== null && body !== undefined) {
            options.body =
                typeof body === 'string' ? body : JSON.stringify(body);
        }

        let response;

        try {
            response = await this.#fetch(url, options);
        } catch (error) {
            if (controller.signal.aborted && !signal?.aborted) {
                throw new ApiError({
                    code: 'TIEMPO_AGOTADO',
                    message: 'La solicitud tardó demasiado. Intenta de nuevo.',
                });
            }

            if (error?.name === 'AbortError') {
                throw error;
            }

            throw new ApiError({
                code: 'ERROR_DE_RED',
                message:
                    'No se pudo conectar con el servidor. Revisa tu conexión.',
            });
        } finally {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }

        const payload = await this.#leerCuerpo(response);

        if (!response.ok) {
            throw this.#construirError(response, payload);
        }

        return payload;
    }

    #construirUrl(path, query) {
        const ruta = String(path).replace(/^\/+/, '');
        let url = `${this.#baseUrl}/${ruta}`;

        if (query && typeof query === 'object') {
            const params = new URLSearchParams();

            Object.entries(query).forEach(([clave, valor]) => {
                if (valor !== undefined && valor !== null && valor !== '') {
                    params.append(clave, valor);
                }
            });

            const cadena = params.toString();

            if (cadena) {
                url += `?${cadena}`;
            }
        }

        return url;
    }

    async #leerCuerpo(response) {
        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get('content-type') ?? '';

        if (!contentType.includes('application/json')) {
            const texto = await response.text();
            return texto.length > 0 ? texto : null;
        }

        try {
            return await response.json();
        } catch {
            return null;
        }
    }

    #construirError(response, payload) {
        const datos = payload && typeof payload === 'object' ? payload : {};

        return new ApiError({
            status: response.status,
            code: datos.code ?? `HTTP_${response.status}`,
            message: datos.message ?? this.#mensajePorDefecto(response.status),
            errors: this.#normalizarErrores(datos.errors),
        });
    }

    #normalizarErrores(errors) {
        if (!errors || typeof errors !== 'object') {
            return {};
        }

        return Object.entries(errors).reduce((acumulado, [campo, valor]) => {
            acumulado[campo] = Array.isArray(valor) ? valor : [String(valor)];
            return acumulado;
        }, {});
    }

    #mensajePorDefecto(status) {
        switch (status) {
            case 401:
                return 'No se encontró una sesión válida. Inicia sesión de nuevo.';
            case 403:
                return 'No tienes permisos para realizar esta acción.';
            case 404:
                return 'El recurso solicitado no existe.';
            case 422:
                return 'Los datos enviados no son válidos.';
            case 429:
                return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
            case 500:
                return 'Ocurrió un error interno en el servidor.';
            default:
                return 'No se pudo completar la solicitud.';
        }
    }
}

export const api = new ApiClient({ baseUrl: API_BASE_URL });
