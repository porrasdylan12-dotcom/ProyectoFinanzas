import { escaparHtml, setHtml } from '../../core/index.js';
import {
    cargarUsuario,
    cerrarSesion,
    estaAutenticado,
    usuarioActual,
} from '../state.js';

function pintarUsuario(usuario) {
    const titulo = document.querySelector('#bienvenida');
    const enlaceUsuario = document.querySelector('.barra__usuario');
    const tarjeta = document.querySelector('#usuario');
    const valores = tarjeta ? tarjeta.querySelectorAll('.dato__valor') : [];
    const nombre = usuario && usuario.nombre ? usuario.nombre : '';
    const correo = usuario && usuario.email ? usuario.email : '';

    if (titulo) {
        titulo.textContent = nombre ? `Hola, ${nombre}` : 'Hola';
    }

    if (enlaceUsuario) {
        enlaceUsuario.textContent = nombre ? `[${nombre}]` : '[invitado]';
    }

    if (valores[0]) {
        setHtml(valores[0], escaparHtml(nombre || '—'));
    }

    if (valores[1]) {
        setHtml(valores[1], escaparHtml(correo || '—'));
    }
}

function conectarCierreDeSesion() {
    const enlace = document.querySelector('a.enlace-accion--suave');

    if (!enlace) {
        return;
    }

    enlace.addEventListener('click', async (evento) => {
        evento.preventDefault();
        await cerrarSesion();
        window.location.assign('login.html');
    });
}

export function init() {
    const titulo = document.querySelector('#bienvenida');
    const tarjeta = document.querySelector('#usuario');

    if (!titulo || !tarjeta) {
        return;
    }

    if (!estaAutenticado()) {
        window.location.replace('login.html');

        return;
    }

    pintarUsuario(usuarioActual());
    conectarCierreDeSesion();

    cargarUsuario()
        .then(pintarUsuario)
        .catch((error) => {
            if (error && error.status === 401) {
                window.location.replace('login.html');
            }
        });
}
