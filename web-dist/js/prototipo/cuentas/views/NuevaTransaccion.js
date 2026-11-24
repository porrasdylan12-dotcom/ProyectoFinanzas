import {
    aplicarErroresDeValidacion,
    conectarBorrador,
    establecerCargando,
    limpiarBorrador,
    limpiarErroresDeFormulario,
    mostrarAviso,
    ocultarAviso,
} from '../../core/index.js';
import { crearTransaccion, listarCategorias, listarCuentas } from '../api.js';

const MAPA_CAMPOS = {
    account_id: 'transaccion-cuenta',
    type: 'tipo-ingreso',
    category_id: 'transaccion-categoria',
    amount: 'transaccion-monto',
    transaction_date: 'transaccion-fecha',
    description: 'transaccion-descripcion',
};

function rellenarCuentas(cuentas) {
    const select = document.querySelector('#transaccion-cuenta');

    if (!select) {
        return;
    }

    cuentas
        .filter((c) => c && (c.id || c.value))
        .forEach((cuenta) => {
            const valor = String(cuenta.id ?? cuenta.value);
            const texto = String(cuenta.nombre ?? cuenta.name ?? valor);

            if (select.querySelector(`option[value="${valor}"]`)) {
                return;
            }

            const opcion = document.createElement('option');
            opcion.value = valor;
            opcion.textContent = texto;
            select.append(opcion);
        });
}

function rellenarCategorias(categorias) {
    const select = document.querySelector('#transaccion-categoria');

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

async function cargarCuentasYcategorias(restaurar) {
    let cuentas = [];
    let categorias = [];

    try {
        [cuentas, categorias] = await Promise.all([
            listarCuentas(),
            listarCategorias(),
        ]);
    } catch {}

    if (Array.isArray(cuentas)) {
        rellenarCuentas(cuentas);
    }
    if (Array.isArray(categorias)) {
        rellenarCategorias(categorias);
    }

    restaurar();
}

export function init() {
    const formulario = document.querySelector('form.formulario');
    const cuenta = document.querySelector('#transaccion-cuenta');
    const tipoIngreso = document.querySelector('#tipo-ingreso');
    const tipoGasto = document.querySelector('#tipo-gasto');
    const categoria = document.querySelector('#transaccion-categoria');
    const monto = document.querySelector('#transaccion-monto');
    const fecha = document.querySelector('#transaccion-fecha');
    const descripcion = document.querySelector('#transaccion-descripcion');

    if (
        !formulario ||
        !cuenta ||
        !tipoIngreso ||
        !tipoGasto ||
        !categoria ||
        !monto ||
        !fecha
    ) {
        return;
    }

    const restaurar = conectarBorrador(formulario);

    void cargarCuentasYcategorias(restaurar);

    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        ocultarAviso(formulario);
        limpiarErroresDeFormulario(formulario);
        establecerCargando(boton, true, 'Guardando…');

        const tipo = tipoIngreso.checked ? tipoIngreso.value : tipoGasto.value;

        try {
            await crearTransaccion({
                account_id: Number(cuenta.value),
                type: tipo,
                category_id: Number(categoria.value),
                amount: Number(monto.value),
                transaction_date: fecha.value,
                description: descripcion ? descripcion.value.trim() : '',
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
                    ? error.message || 'No se pudo crear la transacción.'
                    : 'Revisa los campos marcados.',
                'error',
            );
        } finally {
            establecerCargando(boton, false);
        }
    });
}
