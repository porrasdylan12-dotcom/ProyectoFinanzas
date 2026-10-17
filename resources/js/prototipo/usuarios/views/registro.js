import {
    aplicarErroresDeValidacion,
    establecerCargando,
    limpiarErroresDeFormulario,
    mostrarAviso,
    ocultarAviso,
} from '../../core/index.js';
import { registrarCuenta } from '../state.js';

const MAPA_CAMPOS = { name: 'nombre', email: 'correo', password: 'clave' };

export function init() {
    const formulario = document.querySelector('form.formulario');
    const nombre = document.querySelector('#nombre');
    const correo = document.querySelector('#correo');
    const clave = document.querySelector('#clave');
    const confirmar = document.querySelector('#clave-confirmar');

    if (!formulario || !nombre || !correo || !clave || !confirmar) {
        return;
    }

    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        ocultarAviso(formulario);
        limpiarErroresDeFormulario(formulario);

        if (clave.value !== confirmar.value) {
            aplicarErroresDeValidacion(
                formulario,
                { password: ['Las contraseñas no coinciden.'] },
                { password: 'clave-confirmar' },
            );
            mostrarAviso(formulario, 'Las contraseñas no coinciden.', 'error');

            return;
        }

        establecerCargando(boton, true, 'Creando cuenta…');

        try {
            await registrarCuenta({
                name: nombre.value.trim(),
                email: correo.value.trim(),
                password: clave.value,
                passwordConfirmation: confirmar.value,
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
                    ? error.message || 'No se pudo crear la cuenta.'
                    : 'Revisa los campos marcados.',
                'error',
            );
        } finally {
            establecerCargando(boton, false);
        }
    });
}
