import {
    aplicarErroresDeValidacion,
    conectarBorrador,
    establecerCargando,
    limpiarBorrador,
    limpiarErroresDeFormulario,
    mostrarAviso,
    ocultarAviso,
} from '../../core/index.js';
import { solicitarRecuperacion } from '../state.js';

const MAPA_CAMPOS = { email: 'correo' };

export function init() {
    const formulario = document.querySelector('form.formulario');
    const correo = document.querySelector('#correo');

    if (!formulario || !correo) {
        return;
    }

    const boton = formulario.querySelector('button[type="submit"]');

    conectarBorrador(formulario);

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        ocultarAviso(formulario);
        limpiarErroresDeFormulario(formulario);
        establecerCargando(boton, true, 'Enviando…');

        try {
            await solicitarRecuperacion({ email: correo.value.trim() });

            limpiarBorrador();
            formulario.reset();
            mostrarAviso(
                formulario,
                'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
                'exito',
            );
        } catch (error) {
            const aplicados = aplicarErroresDeValidacion(
                formulario,
                error.errors,
                MAPA_CAMPOS,
            );

            mostrarAviso(
                formulario,
                aplicados === 0
                    ? error.message || 'No se pudo enviar el enlace.'
                    : 'Revisa los campos marcados.',
                'error',
            );
        } finally {
            establecerCargando(boton, false);
        }
    });
}
