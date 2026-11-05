import {
    aplicarErroresDeValidacion,
    conectarBorrador,
    establecerCargando,
    limpiarBorrador,
    limpiarErroresDeFormulario,
    mostrarAviso,
    ocultarAviso,
} from '../../core/index.js';
import { crearCuenta } from '../api.js';

const MAPA_CAMPOS = {
    name: 'cuenta-nombre',
    type: 'cuenta-tipo',
    balance: 'cuenta-saldo',
};

export function init() {
    const formulario = document.querySelector('form.formulario');
    const nombre = document.querySelector('#cuenta-nombre');
    const tipo = document.querySelector('#cuenta-tipo');
    const saldo = document.querySelector('#cuenta-saldo');

    if (!formulario || !nombre || !tipo || !saldo) {
        return;
    }

    const boton = formulario.querySelector('button[type="submit"]');

    conectarBorrador(formulario);

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        ocultarAviso(formulario);
        limpiarErroresDeFormulario(formulario);
        establecerCargando(boton, true, 'Guardando…');

        try {
            await crearCuenta({
                name: nombre.value.trim(),
                type: tipo.value,
                balance: Number(saldo.value),
            });

            limpiarBorrador();
            window.location.assign('cuentas.html');
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
