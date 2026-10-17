import { escaparHtml, setHtml } from '../../core/index.js';
import { estaAutenticado } from '../../usuarios/state.js';
import {
    listarCuentas,
    listarPresupuestos,
    listarTransaccionesDeCuenta,
} from '../api.js';
import { getState, setCuentaSeleccionada, suscribir } from '../state.js';

let cuentaSeleccionadaId = null;

function renderizarCuentas(cuentas) {
    const lista = document.querySelector('.lista-cuentas');

    if (!lista) {
        return;
    }

    if (!cuentas.length) {
        setHtml(
            lista,
            '<li class="cuenta"><span class="cuenta__tipo">Sin cuentas</span></li>',
        );

        return;
    }

    setHtml(
        lista,
        cuentas
            .map(
                (cuenta) => `<li class="cuenta" data-id="${cuenta.id}">
                    <span class="cuenta__tipo">${escaparHtml(cuenta.nombre || '')}</span>
                    <span class="cuenta__saldo">$ ${Number(cuenta.saldo || 0).toFixed(2)}</span>
                </li>`,
            )
            .join(''),
    );

    lista.querySelectorAll('.cuenta').forEach((elemento) => {
        elemento.addEventListener('click', () => {
            const id = Number(elemento.dataset.id);
            const cuenta = cuentas.find((c) => Number(c.id) === id);

            if (cuenta) {
                seleccionarCuenta(cuenta);
            }
        });
    });

    if (!cuentaSeleccionadaId) {
        seleccionarCuenta(cuentas[0]);
    }
}

function renderizarPresupuestos(presupuestos) {
    const lista = document.querySelector('.lista-presupuestos');

    if (!lista) {
        return;
    }

    if (!presupuestos.length) {
        setHtml(
            lista,
            '<li class="presupuesto"><span class="presupuesto__categoria">Sin presupuestos</span></li>',
        );

        return;
    }

    setHtml(
        lista,
        presupuestos
            .map(
                (presupuesto) => `<li class="presupuesto">
                    <span class="presupuesto__categoria">${escaparHtml(presupuesto.categoria || presupuesto.nombre || '')}</span>
                    <span class="presupuesto__monto"><strong>$ ${Number(presupuesto.gastado || 0).toFixed(2)}</strong> / $ ${Number(presupuesto.maximo || 0).toFixed(2)}</span>
                </li>`,
            )
            .join(''),
    );
}

function renderizarDetalle(cuenta) {
    const titulo = document.querySelector('#cuenta-seleccionada + h3');
    const saldo = document.querySelector('.saldo__valor');

    if (titulo) {
        titulo.textContent = cuenta ? cuenta.nombre : '[Sin cuenta]';
    }

    if (saldo) {
        saldo.textContent = cuenta
            ? `$ ${Number(cuenta.saldo || 0).toFixed(2)}`
            : '$ [0.00]';
    }
}

function renderizarTransacciones(transacciones) {
    const cuerpo = document.querySelector('tbody');

    if (!cuerpo) {
        return;
    }

    if (!transacciones.length) {
        setHtml(cuerpo, '<tr><td colspan="4">Sin transacciones</td></tr>');

        return;
    }

    setHtml(
        cuerpo,
        transacciones
            .map(
                (tx) => `<tr>
                    <td>${escaparHtml(tx.fecha || '')}</td>
                    <td>${escaparHtml(tx.descripcion || tx.nombre || '')}</td>
                    <td>${escaparHtml(tx.categoria || '')}</td>
                    <td>${tx.tipo === 'gasto' ? '-' : '+'}$ ${Number(tx.monto || 0).toFixed(2)}</td>
                </tr>`,
            )
            .join(''),
    );
}

function seleccionarCuenta(cuenta) {
    cuentaSeleccionadaId = Number(cuenta.id);
    setCuentaSeleccionada(cuenta);
    renderizarDetalle(cuenta);
    cargarTransacciones(cuentaSeleccionadaId);
}

function cargarTransacciones(cuentaId) {
    void listarTransaccionesDeCuenta(cuentaId)
        .then(renderizarTransacciones)
        .catch(() => {
            const cuerpo = document.querySelector('tbody');

            if (cuerpo) {
                setHtml(
                    cuerpo,
                    '<tr><td colspan="4">Error al cargar transacciones</td></tr>',
                );
            }
        });
}

function cargarDatosIniciales() {
    void Promise.all([listarCuentas(), listarPresupuestos()])
        .catch(() => [[], []])
        .then(([cuentas, presupuestos]) => {
            renderizarCuentas(cuentas);
            renderizarPresupuestos(presupuestos);
        });
}

export function init() {
    if (!estaAutenticado()) {
        window.location.replace('login.html');

        return;
    }

    suscribir(() => {
        const { cuentaSeleccionada } = getState();

        if (
            cuentaSeleccionada &&
            Number(cuentaSeleccionada.id) !== cuentaSeleccionadaId
        ) {
            cuentaSeleccionadaId = Number(cuentaSeleccionada.id);
            renderizarDetalle(cuentaSeleccionada);
            cargarTransacciones(cuentaSeleccionadaId);
        }
    });

    cargarDatosIniciales();
}
