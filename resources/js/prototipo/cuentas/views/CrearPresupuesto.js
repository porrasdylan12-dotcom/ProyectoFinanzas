import {
    aplicarErroresDeValidacion,
    conectarBorrador,
    establecerCargando,
    limpiarBorrador,
    limpiarErroresDeFormulario,
    mostrarAviso,
    ocultarAviso,
} from '../../core/index.js';
import { crearPresupuesto, listarCategorias } from '../api.js';

const MAPA_CAMPOS = {
    name: 'presupuesto-nombre',
    category_id: 'categoria',
    maxAmount: 'presupuesto-limite',
    month: 'presupuesto-mes',
    year: 'presupuesto-anio',
};

function rellenarCategorias(categorias) {
    const select = document.querySelector('#categoria');

    if (!select) {
        return;
    }

    categorias
        .filter((c) => c && (c.id || c.value))
        .forEach((categoria) => {
            const valor = String(categoria.id ?? categoria.value);
            const texto = String(categoria.nombre ?? categoria.name ?? valor);

            if (select.querySelector(`option[value="${valor}"]`)) {
                return;
            }

            const opcion = document.createElement('option');
            opcion.value = valor;
            opcion.textContent = texto;
            select.append(opcion);
        });
}

async function cargarCategorias(restaurar) {
    let categorias = [];

    try {
        categorias = await listarCategorias();
    } catch {
    }

    if (Array.isArray(categorias)) {
        rellenarCategorias(categorias);
    }

    restaurar();
}

export function init() {
    const formulario = document.querySelector('form.formulario');
    const categoria = document.querySelector('#categoria');
    const nombre = document.querySelector('#presupuesto-nombre');
    const limite = document.querySelector('#presupuesto-limite');
    const mes = document.querySelector('#presupuesto-mes');
    const anio = document.querySelector('#presupuesto-anio');

    if (!formulario || !categoria || !nombre || !limite || !mes || !anio) {
        return;
    }

    const restaurar = conectarBorrador(formulario);

    void cargarCategorias(restaurar);

    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        ocultarAviso(formulario);
        limpiarErroresDeFormulario(formulario);
        establecerCargando(boton, true, 'Guardando…');

        try {
            await crearPresupuesto({
                name: nombre.value.trim(),
                category_id: Number(categoria.value),
                maxAmount: Number(limite.value),
                month: Number(mes.value),
                year: Number(anio.value),
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
                    ? error.message || 'No se pudo crear el presupuesto.'
                    : 'Revisa los campos marcados.',
                'error',
            );
        } finally {
            establecerCargando(boton, false);
        }
    });
}
