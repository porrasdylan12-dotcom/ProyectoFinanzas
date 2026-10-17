import {
    aplicarErroresDeValidacion,
    escaparHtml,
    establecerCargando,
    limpiarErroresDeFormulario,
    mostrarAviso,
    ocultarAviso,
    qsa,
    setHtml,
} from '../../core/index.js';
import { crearGastoCompartido, listarGrupos } from '../api.js';

const MAPA_CAMPOS = {
    group_id: 'gasto-grupo',
    amount: 'gasto-monto',
    date: 'gasto-fecha',
    description: 'gasto-descripcion',
};

let grupos = [];

function grupoSeleccionado() {
    const select = document.querySelector('#gasto-grupo');

    if (!select) {
        return null;
    }

    return (
        grupos.find((grupo) => Number(grupo.id) === Number(select.value)) ||
        null
    );
}

function rellenarGrupos() {
    const select = document.querySelector('#gasto-grupo');

    if (!select) {
        return;
    }

    grupos.forEach((grupo) => {
        const valor = String(grupo.id);

        if (select.querySelector(`option[value="${valor}"]`)) {
            return;
        }

        const opcion = document.createElement('option');
        opcion.value = valor;
        opcion.textContent = grupo.nombre || `Grupo #${valor}`;
        select.append(opcion);
    });
}

function renderizarParticipantes() {
    const contenedor = document.querySelector('.opciones');
    const grupo = grupoSeleccionado();

    if (!contenedor) {
        return;
    }

    if (!grupo || !grupo.miembros.length) {
        setHtml(contenedor, '');

        return;
    }

    setHtml(
        contenedor,
        grupo.miembros
            .map(
                (miembro, indice) => `<span class="opcion">
                    <input type="checkbox" id="participante-${indice + 1}" name="participants[]" value="${miembro.id}" checked />
                    <label for="participante-${indice + 1}">${escaparHtml(miembro.nombre || miembro.email)}</label>
                </span>`,
            )
            .join(''),
    );
}

function participantesSeleccionados() {
    return qsa('input[name="participants[]"]:checked').map((casilla) =>
        Number(casilla.value),
    );
}

function mostrarErrorParticipantes(mensaje) {
    const contenedor = document.querySelector('#participantes-error');

    if (!contenedor) {
        return;
    }

    contenedor.textContent = mensaje;
    contenedor.style.display = 'block';
}

function limpiarErrorParticipantes() {
    const contenedor = document.querySelector('#participantes-error');

    if (!contenedor) {
        return;
    }

    contenedor.style.display = '';
    contenedor.textContent = 'Selecciona al menos dos personas participantes.';
}

export function init() {
    const formulario = document.querySelector('form.formulario');
    const grupo = document.querySelector('#gasto-grupo');
    const monto = document.querySelector('#gasto-monto');
    const fecha = document.querySelector('#gasto-fecha');
    const descripcion = document.querySelector('#gasto-descripcion');

    if (!formulario || !grupo || !monto || !fecha || !descripcion) {
        return;
    }

    void listarGrupos()
        .catch(() => [])
        .then((datos) => {
            if (!Array.isArray(datos)) {
                return;
            }

            grupos = datos;
            rellenarGrupos();
        });

    grupo.addEventListener('change', renderizarParticipantes);

    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        ocultarAviso(formulario);
        limpiarErroresDeFormulario(formulario);
        limpiarErrorParticipantes();

        const seleccionados = participantesSeleccionados();

        if (seleccionados.length < 2) {
            mostrarErrorParticipantes(
                'Selecciona al menos dos personas participantes.',
            );

            return;
        }

        establecerCargando(boton, true, 'Guardando…');

        try {
            await crearGastoCompartido({
                group_id: Number(grupo.value),
                amount: Number(monto.value),
                date: fecha.value,
                description: descripcion.value.trim(),
                participants: seleccionados,
            });

            window.location.assign('grupos.html');
        } catch (error) {
            const aplicados = aplicarErroresDeValidacion(
                formulario,
                error.errors,
                MAPA_CAMPOS,
            );

            const errorParticipantes = error.errors
                ? error.errors.participants
                : null;

            if (errorParticipantes) {
                mostrarErrorParticipantes(
                    Array.isArray(errorParticipantes)
                        ? errorParticipantes[0]
                        : String(errorParticipantes),
                );
            }

            if (aplicados === 0 && !errorParticipantes) {
                mostrarAviso(
                    formulario,
                    error.message || 'No se pudo guardar el gasto.',
                    'error',
                );
            }
        } finally {
            establecerCargando(boton, false);
        }
    });
}
