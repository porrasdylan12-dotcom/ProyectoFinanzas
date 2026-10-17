import {
    aplicarErroresDeValidacion,
    establecerCargando,
    limpiarErroresDeFormulario,
    mostrarAviso,
    ocultarAviso,
} from '../../core/index.js';
import { iniciarSesion } from '../state.js';

const MAPA_CAMPOS = { email: 'correo', password: 'clave' };

export function init() {
    const formulario = document.querySelector('form.formulario');
    const correo = document.querySelector('#correo');
    const clave = document.querySelector('#clave');

    if (!formulario || !correo || !clave) {
        return;
    }

    const recordarme = document.querySelector('#recordarme');
    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        ocultarAviso(formulario);
        limpiarErroresDeFormulario(formulario);
        establecerCargando(boton, true, 'Iniciando sesión…');

        try {
            await iniciarSesion({
                email: correo.value.trim(),
                password: clave.value,
                recordar: recordarme ? recordarme.checked : true,
            });

            window.location.assign('panel-principal.html');
        } catch (error) {
            const aplicados = aplicarErroresDeValidacion(
                formulario,
                error.errors,
                MAPA_CAMPOS,
            );

            mostrarAviso(
                formulario,
                aplicados === 0
                    ? error.message || 'No se pudo iniciar sesión.'
                    : 'Revisa los campos marcados.',
                'error',
            );
        } finally {
            establecerCargando(boton, false);
        }
    });
}
