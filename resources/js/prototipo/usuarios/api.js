import { api } from '../core/index.js';

export function normalizarUsuario(datos) {
    if (!datos) {
        return null;
    }

    return {
        id: datos.id ?? null,
        nombre: datos.nombre ?? '',
        email: datos.email ?? '',
        creada: datos.creada ?? null,
        actualizada: datos.actualizada ?? null,
    };
}

export async function iniciarSesion({ email, password }) {
    const respuesta = await api.post('/login', { email, password });

    return { token: respuesta.token, user: respuesta.user };
}

export async function registrarCuenta({
    name,
    email,
    password,
    passwordConfirmation,
}) {
    const respuesta = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
    });

    return { token: respuesta.token, user: respuesta.user };
}

export async function cerrarSesion() {
    return api.post('/logout');
}

export async function obtenerUsuario() {
    const respuesta = await api.get('/user');

    return respuesta && respuesta.data ? respuesta.data : respuesta;
}
