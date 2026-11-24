import {
    aplicarErroresDeValidacion,
    conectarBorrador,
    escaparHtml,
    establecerCargando,
    limpiarBorrador,
    limpiarErroresDeFormulario,
    mostrarAviso,
    ocultarAviso,
    setHtml,
} from '../../core/index.js';
import {
    actualizarPerfil,
    cambiarContrasena,
    cargarUsuario,
    cerrarSesion,
    estaAutenticado,
    usuarioActual,
} from '../state.js';

const MAPA_PERFIL = { name: 'perfil-nombre', email: 'perfil-correo' };

const MAPA_CLAVE = {
    current_password: 'clave-actual',
    password: 'clave-nueva',
    password_confirmation: 'clave-nueva-confirmar',
};

let restaurarBorradorPerfil = null;

function idDe(usuario) {
    return usuario && usuario.id !== null && usuario.id !== undefined
        ? String(usuario.id)
        : '';
}

function pintarUsuario(usuario) {
    const enlaceUsuario = document.querySelector('.barra__usuario');
    const nombre = usuario && usuario.nombre ? usuario.nombre : '';
    const correo = usuario && usuario.email ? usuario.email : '';
    const campoNombre = document.querySelector('#perfil-nombre');
    const campoCorreo = document.querySelector('#perfil-correo');
    const campoId = document.querySelector('#perfil-id');

    if (enlaceUsuario) {
        enlaceUsuario.textContent = nombre ? `[${nombre}]` : '[invitado]';
    }

    if (campoNombre) {
        campoNombre.value = nombre;
    }

    if (campoCorreo) {
        campoCorreo.value = correo;
    }

    if (campoId) {
        campoId.value = idDe(usuario);
    }
}

function inyectarCampoId(seccionInfo, usuario) {
    const fieldset = seccionInfo.querySelector('fieldset.grupo-campos');

    if (!fieldset || fieldset.querySelector('#perfil-id')) {
        return;
    }

    const contenedor = document.createElement('div');
    contenedor.className = 'campo';
    setHtml(
        contenedor,
        `
        <label for="perfil-id">ID de usuario</label>
        <input
            type="text"
            id="perfil-id"
            name="id"
            readonly
            value="${escaparHtml(idDe(usuario))}"
            aria-describedby="perfil-id-ayuda"
        />
        <p class="campo__ayuda" id="perfil-id-ayuda">
            Comparte este ID con quien deba añadirte a un grupo.
        </p>
    `,
    );

    const leyenda = fieldset.querySelector('legend');

    if (leyenda) {
        leyenda.insertAdjacentElement('afterend', contenedor);
    } else {
        fieldset.prepend(contenedor);
    }
}

function conectarFormularioPerfil(formulario) {
    if (!formulario) {
        return;
    }

    restaurarBorradorPerfil = conectarBorrador(formulario, 'perfil');

    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        ocultarAviso(formulario);
        limpiarErroresDeFormulario(formulario);

        const nombre = formulario.querySelector('#perfil-nombre');
        const correo = formulario.querySelector('#perfil-correo');

        establecerCargando(boton, true, 'Guardando…');

        try {
            await actualizarPerfil({
                name: nombre ? nombre.value.trim() : '',
                email: correo ? correo.value.trim() : '',
            });

            limpiarBorrador('perfil');
            window.location.assign('panel-principal.html');
        } catch (error) {
            const aplicados = aplicarErroresDeValidacion(
                formulario,
                error.errors,
                MAPA_PERFIL,
            );

            mostrarAviso(
                formulario,
                aplicados === 0
                    ? error.message || 'No se pudieron guardar los cambios.'
                    : 'Revisa los campos marcados.',
                'error',
            );
        } finally {
            establecerCargando(boton, false);
        }
    });
}

function conectarFormularioClave(formulario) {
    if (!formulario) {
        return;
    }

    conectarBorrador(formulario, 'clave');

    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        ocultarAviso(formulario);
        limpiarErroresDeFormulario(formulario);

        const actual = formulario.querySelector('#clave-actual');
        const nueva = formulario.querySelector('#clave-nueva');
        const confirmar = formulario.querySelector('#clave-nueva-confirmar');

        if (nueva.value !== confirmar.value) {
            aplicarErroresDeValidacion(
                formulario,
                { password: ['Las contraseñas no coinciden.'] },
                { password: 'clave-nueva-confirmar' },
            );
            mostrarAviso(formulario, 'Las contraseñas no coinciden.', 'error');

            return;
        }

        establecerCargando(boton, true, 'Actualizando…');

        try {
            await cambiarContrasena({
                currentPassword: actual.value,
                password: nueva.value,
                passwordConfirmation: confirmar.value,
            });

            limpiarBorrador('clave');
            formulario.reset();
            mostrarAviso(
                formulario,
                'Contraseña actualizada correctamente.',
                'exito',
            );
        } catch (error) {
            const aplicados = aplicarErroresDeValidacion(
                formulario,
                error.errors,
                MAPA_CLAVE,
            );

            mostrarAviso(
                formulario,
                aplicados === 0
                    ? error.message || 'No se pudo actualizar la contraseña.'
                    : 'Revisa los campos marcados.',
                'error',
            );
        } finally {
            establecerCargando(boton, false);
        }
    });
}

function conectarCierreDeSesion() {
    const enlace = document.querySelector('.cabecera-pagina a.enlace-accion');

    if (!enlace) {
        return;
    }

    enlace.addEventListener('click', async (evento) => {
        evento.preventDefault();
        await cerrarSesion();
        window.location.assign('login.html');
    });
}

async function refrescarUsuario() {
    try {
        const actualizado = await cargarUsuario();
        pintarUsuario(actualizado);

        if (restaurarBorradorPerfil) {
            restaurarBorradorPerfil();
        }
    } catch (error) {
        if (error && error.status === 401) {
            window.location.replace('login.html');
        }
    }
}

export function init() {
    const seccionInfo = document.querySelector(
        'section.card[aria-labelledby="info-personal"]',
    );
    const seccionClave = document.querySelector(
        'section.card[aria-labelledby="cambiar-clave"]',
    );

    if (!seccionInfo || !seccionClave) {
        return;
    }

    if (!estaAutenticado()) {
        window.location.replace('login.html');

        return;
    }

    const usuario = usuarioActual();
    inyectarCampoId(seccionInfo, usuario);
    pintarUsuario(usuario);

    conectarFormularioPerfil(seccionInfo.querySelector('form.formulario'));
    conectarFormularioClave(seccionClave.querySelector('form.formulario'));
    conectarCierreDeSesion();

    void refrescarUsuario();
}
