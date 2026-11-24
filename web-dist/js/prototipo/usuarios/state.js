import { store } from '../core/index.js';
import {
    iniciarSesion as solicitarLogin,
    registrarCuenta as solicitarRegistro,
    cerrarSesion as solicitarLogout,
    obtenerUsuario,
    actualizarPerfil as solicitarActualizarPerfil,
    cambiarContrasena as solicitarCambioContrasena,
    solicitarEnlaceRecuperacion,
    normalizarUsuario,
} from './api.js';

export function estadoUsuario() {
    return store.getState();
}

export function suscribir(oyente) {
    return store.subscribe(oyente);
}

export function estaAutenticado() {
    return Boolean(store.getState().token);
}

export function usuarioActual() {
    return store.getState().user;
}

async function ejecutar(accion, mensajeExito) {
    store.setLoading(true);
    store.clearErrors();
    store.setMessage(null);

    try {
        const resultado = await accion();

        if (mensajeExito) {
            store.setMessage(mensajeExito);
        }

        return resultado;
    } catch (error) {
        store.setErrors(error && error.errors ? error.errors : {});
        store.setMessage(error && error.message ? error.message : null);
        throw error;
    } finally {
        store.setLoading(false);
    }
}

export function iniciarSesion({ email, password, recordar = true }) {
    return ejecutar(async () => {
        const { token, user } = await solicitarLogin({ email, password });
        store.setSesion({ token, user: normalizarUsuario(user), recordar });

        return store.getState().user;
    }, 'Sesión iniciada correctamente.');
}

export function registrarCuenta({
    name,
    email,
    password,
    passwordConfirmation,
    recordar = true,
}) {
    return ejecutar(async () => {
        const { token, user } = await solicitarRegistro({
            name,
            email,
            password,
            passwordConfirmation,
        });
        store.setSesion({ token, user: normalizarUsuario(user), recordar });

        return store.getState().user;
    }, 'Cuenta creada correctamente.');
}

export async function cerrarSesion() {
    try {
        if (estaAutenticado()) {
            await solicitarLogout();
        }
    } catch (error) {
        console.error('No se pudo cerrar la sesión en el servidor:', error);
    } finally {
        store.limpiarSesion();
        store.setMessage('Sesión cerrada correctamente.');
    }
}

export async function cargarUsuario() {
    if (!estaAutenticado()) {
        return null;
    }

    store.setLoading(true);

    try {
        const usuario = normalizarUsuario(await obtenerUsuario());
        store.setUser(usuario);

        return usuario;
    } catch (error) {
        if (error && error.status === 401) {
            store.limpiarSesion();
        }

        throw error;
    } finally {
        store.setLoading(false);
    }
}

export function actualizarPerfil({ name, email }) {
    return ejecutar(async () => {
        const usuario = normalizarUsuario(
            await solicitarActualizarPerfil({ name, email }),
        );
        store.setUser(usuario);

        return usuario;
    }, 'Datos actualizados correctamente.');
}

export function cambiarContrasena({
    currentPassword,
    password,
    passwordConfirmation,
}) {
    return ejecutar(
        () =>
            solicitarCambioContrasena({
                currentPassword,
                password,
                passwordConfirmation,
            }),
        'Contraseña actualizada correctamente.',
    );
}

export function solicitarRecuperacion({ email }) {
    return ejecutar(
        () => solicitarEnlaceRecuperacion({ email }),
        'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
    );
}
