import {
    aplicarErroresDeValidacion,
    establecerCargando,
    limpiarErroresDeFormulario,
    mostrarAviso,
    ocultarAviso,
} from '../../core/index.js';
import { agregarMiembro, listarGrupos, resolverUsuarioId } from '../api.js';

const MAPA_CAMPOS = {
    group_id: 'usuario-grupo',
    email: 'usuario-correo',
};

function rellenarGrupos(grupos, yoId) {
    const select = document.querySelector('#usuario-grupo');

    if (!select) {
        return;
    }

    grupos
        .filter((grupo) => {
            const mio = grupo.miembros.find(
                (miembro) => Number(miembro.id) === Number(yoId),
            );

            return mio && mio.rol === 'admin';
        })
        .forEach((grupo) => {
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

async function cargarGrupos() {
    let yoId = null;
    let grupos = [];

    try {
        [yoId, grupos] = await Promise.all([
            resolverUsuarioId(),
            listarGrupos(),
        ]);
    } catch {}

    if (Array.isArray(grupos)) {
        rellenarGrupos(grupos, yoId);
    }
}

export function init() {
    const formulario = document.querySelector('form.formulario');
    const grupo = document.querySelector('#usuario-grupo');
    const correo = document.querySelector('#usuario-correo');

    if (!formulario || !grupo || !correo) {
        return;
    }

    void cargarGrupos();

    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        ocultarAviso(formulario);
        limpiarErroresDeFormulario(formulario);
        establecerCargando(boton, true, 'Añadiendo…');

        try {
            await agregarMiembro(Number(grupo.value), {
                email: correo.value.trim(),
            });

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
                    ? error.message || 'No se pudo añadir a la persona.'
                    : 'Revisa los campos marcados.',
                'error',
            );
        } finally {
            establecerCargando(boton, false);
        }
    });
}
