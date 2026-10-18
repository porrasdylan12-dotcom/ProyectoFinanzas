import {
    establecerCargando,
    mostrarAviso,
    ocultarAviso,
    setHtml,
} from '../../core/index.js';
import {
    listarDeudas,
    listarGrupos,
    resolverUsuarioId,
    saldarDeuda,
} from '../api.js';

let deudasPendientes = [];

function formatearMonto(valor) {
    return `$ ${Number(valor || 0).toFixed(2)}`;
}

function construirMapaNombres(grupos) {
    const nombres = new Map();

    grupos.forEach((grupo) => {
        grupo.miembros.forEach((miembro) => {
            nombres.set(Number(miembro.id), miembro.nombre || miembro.email);
        });
    });

    return nombres;
}

function nombreDe(nombres, id) {
    return nombres.get(Number(id)) || `Usuario #${id}`;
}

function rellenarDeudas(deudas, nombres) {
    const select = document.querySelector('#deuda');

    if (!select) {
        return;
    }

    const marcador = select.querySelector('option[value=""]');

    setHtml(select, '');

    if (marcador) {
        select.append(marcador);
    }

    if (!deudas.length) {
        const opcion = document.createElement('option');
        opcion.value = '';
        opcion.disabled = true;
        opcion.textContent = 'No tienes deudas pendientes';
        select.append(opcion);

        return;
    }

    deudas.forEach((deuda) => {
        const opcion = document.createElement('option');
        const fecha = String(deuda.creada || '').slice(0, 10);
        opcion.value = String(deuda.id);
        opcion.textContent = `${nombreDe(nombres, deuda.deudorId)} le debe ${formatearMonto(deuda.monto)} a ${nombreDe(nombres, deuda.acreedorId)}${fecha ? ` · ${fecha}` : ''}`;
        select.append(opcion);
    });
}

function mostrarErrorConfirmacion(mensaje) {
    const contenedor = document.querySelector('#deuda-importe-error');

    if (!contenedor) {
        return;
    }

    contenedor.textContent = mensaje;
    contenedor.style.display = 'block';
}

function limpiarErrorConfirmacion() {
    const contenedor = document.querySelector('#deuda-importe-error');

    if (!contenedor) {
        return;
    }

    contenedor.style.display = '';
    contenedor.textContent =
        'Confirma que quieres marcar la deuda como pagada.';
}

async function cargarDeudasPendientes() {
    let yoId = null;
    let deudas = [];
    let grupos = [];

    try {
        [yoId, deudas, grupos] = await Promise.all([
            resolverUsuarioId(),
            listarDeudas({ status: 'pending', per_page: 50 }),
            listarGrupos(),
        ]);
    } catch {
       
    }

    const nombres = construirMapaNombres(grupos);

    deudasPendientes = deudas.filter(
        (deuda) => Number(deuda.deudorId) === Number(yoId),
    );

    rellenarDeudas(deudasPendientes, nombres);
}

export function init() {
    const formulario = document.querySelector('form.formulario');
    const select = document.querySelector('#deuda');
    const confirmar = document.querySelector('#deuda-importe');

    if (!formulario || !select || !confirmar) {
        return;
    }

    void cargarDeudasPendientes();

    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        ocultarAviso(formulario);
        limpiarErrorConfirmacion();

        const deuda = deudasPendientes.find(
            (item) => Number(item.id) === Number(select.value),
        );

        if (!deuda) {
            mostrarAviso(
                formulario,
                'Selecciona una deuda pendiente.',
                'error',
            );

            return;
        }

        if (!confirmar.checked) {
            mostrarErrorConfirmacion(
                'Confirma que quieres marcar la deuda como pagada.',
            );

            return;
        }

        establecerCargando(boton, true, 'Saldando…');

        try {
            await saldarDeuda(deuda);

            window.location.assign('grupos.html');
        } catch (error) {
            mostrarAviso(
                formulario,
                error.message || 'No se pudo saldar la deuda.',
                'error',
            );
        } finally {
            establecerCargando(boton, false);
        }
    });
}
