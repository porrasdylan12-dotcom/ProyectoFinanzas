import { api } from './ApiClient.js';
import { TOKEN_KEY, USER_KEY } from './config.js';

const oyentes = new Set();

let estado = {
    token: null,
    user: null,
    loading: false,
    errors: {},
    message: null,
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
};

function leerStorage(clave) {
    try {
        return window.localStorage.getItem(clave);
    } catch {
        return null;
    }
}

function guardarStorage(clave, valor) {
    try {
        if (valor === null || valor === undefined) {
            window.localStorage.removeItem(clave);
        } else {
            window.localStorage.setItem(clave, valor);
        }
    } catch {
        return;
    }
}

function notificar() {
    oyentes.forEach((oyente) => {
        try {
            oyente(estado);
        } catch (error) {
            console.error('Error en un suscriptor del estado:', error);
        }
    });
}

export function getState() {
    return estado;
}

export function setState(patch) {
    const siguiente = typeof patch === 'function' ? patch(estado) : patch;
    estado = { ...estado, ...siguiente };
    notificar();
    return estado;
}

export function subscribe(oyente) {
    oyentes.add(oyente);
    oyente(estado);

    return () => {
        oyentes.delete(oyente);
    };
}

export const store = {
    getState,
    setState,
    subscribe,

    setToken(token) {
        api.setToken(token);
        guardarStorage(TOKEN_KEY, token);
        return setState({ token: token || null });
    },

    clearToken() {
        api.clearToken();
        guardarStorage(TOKEN_KEY, null);
        return setState({ token: null, user: null });
    },

    setUser(user) {
        guardarStorage(USER_KEY, user ? JSON.stringify(user) : null);
        return setState({ user });
    },

    setLoading(loading) {
        return setState({ loading: Boolean(loading) });
    },

    setErrors(errors) {
        return setState({ errors: errors || {} });
    },

    clearErrors() {
        return setState({ errors: {} });
    },

    setMessage(message) {
        return setState({ message: message || null });
    },
};

function inicializar() {
    const tokenGuardado = leerStorage(TOKEN_KEY);

    if (tokenGuardado) {
        api.setToken(tokenGuardado);
        estado = { ...estado, token: tokenGuardado };
    }

    const usuarioGuardado = leerStorage(USER_KEY);

    if (usuarioGuardado) {
        try {
            estado = { ...estado, user: JSON.parse(usuarioGuardado) };
        } catch {
            guardarStorage(USER_KEY, null);
        }
    }
}

inicializar();

export default store;
