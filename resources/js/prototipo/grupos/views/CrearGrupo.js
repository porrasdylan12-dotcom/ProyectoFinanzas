import {
    aplicarErroresDeValidacion,
    establecerCargando,
    limpiarErroresDeFormulario,
    mostrarAviso,
    ocultarAviso,
} from '../../core/index.js';
import { crearGrupo } from '../api.js';

const MAPA_CAMPOS = {
    name: 'grupo-nombre',
};

export function init() {
    const formulario = document.querySelector('form.formulario');
    const nombre = document.querySelector('#grupo-nombre');

    if (!formulario || !nombre) {
        return;
    }

    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        ocultarAviso(formulario);
        limpiarErroresDeFormulario(formulario);
        establecerCargando(boton, true, 'Creando…');

        try {
            await crearGrupo({ name: nombre.value.trim() });

            window.location.assign('grupos.html');
        } catch (error) {
            const aplicados = aplicarErroresDeValidacion(
                formulario,
                error.errors,
                MAPA_CAMPOS,
            );

            mostrarAviso(
                formulario,
                aplicados === 0
                    ? error.message || 'No se pudo crear el grupo.'
                    : 'Revisa los campos marcados.',
                'error',
            );
        } finally {
            establecerCargando(boton, false);
        }
    });
}
