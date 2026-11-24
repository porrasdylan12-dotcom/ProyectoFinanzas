import { api } from './ApiClient.js';
import { TOKEN_KEY, USER_KEY } from './config.js';

const oyentes = new Set();

let almacenActivo = 'local';

let estado = {
    token: null,
    user: null,
    loading: false,
    errors: {},
    message: null,
};

function obtenerAlmacen(nombre) {
    try {
        return nombre === 'sesion'
            ? window.sessionStorage
            : window.localStorage;
    } catch {
        return null;
    }
}

function leer(nombre, clave) {
    const almacen = obtenerAlmacen(nombre);

    if (!almacen) {
        return null;
    }

    try {
        return almacen.getItem(clave);
    } catch {
        return null;
    }
}

function escribir(nombre, clave, valor) {
    const almacen = obtenerAlmacen(nombre);

    if (!almacen) {
        return;
    }

    try {
        if (valor === null || valor === undefined) {
            almacen.removeItem(clave);
        } else {
            almacen.setItem(clave, valor);
        }
    } catch {
        return;
    }
}

function limpiarSesionGuardada() {
    escribir('local', TOKEN_KEY, null);
    escribir('local', USER_KEY, null);
    escribir('sesion', TOKEN_KEY, null);
    escribir('sesion', USER_KEY, null);
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

function persistirUsuario() {
    escribir(
        almacenActivo,
        USER_KEY,
        estado.user ? JSON.stringify(estado.user) : null,
    );
}

export const store = {
    getState,
    setState,
    subscribe,

    setSesion({ token, user = null, recordar = true }) {
        almacenActivo = recordar ? 'local' : 'sesion';
        limpiarSesionGuardada();
        api.setToken(token);
        escribir(almacenActivo, TOKEN_KEY, token);
        estado = { ...estado, token: token || null, user };
        persistirUsuario();
        notificar();
        return estado;
    },

    limpiarSesion() {
        limpiarSesionGuardada();
        api.clearToken();
        estado = { ...estado, token: null, user: null, errors: {} };
        notificar();
        return estado;
    },

    setUser(user) {
        estado = { ...estado, user };
        persistirUsuario();
        notificar();
        return estado;
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
    const tokenLocal = leer('local', TOKEN_KEY);
    const tokenSesion = leer('sesion', TOKEN_KEY);
    const token = tokenLocal || tokenSesion;

    if (!token) {
        return;
    }

    almacenActivo = tokenLocal ? 'local' : 'sesion';
    api.setToken(token);
    estado = { ...estado, token };

    const usuario = leer(almacenActivo, USER_KEY);

    if (!usuario) {
        return;
    }

    try {
        estado = { ...estado, user: JSON.parse(usuario) };
    } catch {
        escribir(almacenActivo, USER_KEY, null);
    }
}

inicializar();

export default store;
