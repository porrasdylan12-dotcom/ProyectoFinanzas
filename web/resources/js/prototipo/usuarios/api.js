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

export async function actualizarPerfil({ name, email }) {
    const respuesta = await api.patch('/user', { name, email });

    return respuesta && respuesta.data ? respuesta.data : respuesta;
}

export async function cambiarContrasena({
    currentPassword,
    password,
    passwordConfirmation,
}) {
    return api.put('/user/password', {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
    });
}

export async function solicitarEnlaceRecuperacion({ email }) {
    return api.post('/forgot-password', { email });
}
