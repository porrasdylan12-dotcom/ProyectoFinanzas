import { escaparHtml, qsa, setHtml } from '../../core/index.js';
import { estaAutenticado } from '../../usuarios/state.js';
import {
    listarDeudas,
    listarGastosCompartidos,
    listarGrupos,
    resolverUsuarioId,
} from '../api.js';
import { setDeudas, setGastos, setGrupos } from '../state.js';

function formatearMonto(valor) {
    return `$ ${Number(valor || 0).toFixed(2)}`;
}

function calcularBalance(deudas, yoId) {
    let debes = 0;
    let teDeben = 0;

    deudas.forEach((deuda) => {
        if (deuda.estado !== 'pending') {
            return;
        }

        const monto = Number(deuda.monto || 0);

        if (Number(deuda.deudorId) === Number(yoId)) {
            debes += monto;
        }

        if (Number(deuda.acreedorId) === Number(yoId)) {
            teDeben += monto;
        }
    });

    return { debes, teDeben, neto: teDeben - debes };
}

function renderizarBalance(deudas, yoId) {
    const valores = qsa('.pila .pila__valor');

    if (valores.length < 3) {
        return;
    }

    const { debes, teDeben, neto } = calcularBalance(deudas, yoId);

    valores[0].textContent = formatearMonto(debes);
    valores[1].textContent = formatearMonto(teDeben);
    valores[2].textContent = formatearMonto(neto);
}

function resumenPorGrupo(gastos, deudas, yoId) {
    const resumen = new Map();

    const asegurar = (grupoId) => {
        const clave = Number(grupoId);

        if (!resumen.has(clave)) {
            resumen.set(clave, { deuda: 0, miParte: 0 });
        }

        return resumen.get(clave);
    };

    gastos.forEach((gasto) => {
        const acumulado = asegurar(gasto.grupoId);

        gasto.deudas.forEach((deuda) => {
            if (deuda.estado === 'pending') {
                acumulado.deuda += Number(deuda.monto || 0);
            }
        });
    });

    deudas.forEach((deuda) => {
        if (
            deuda.estado !== 'pending' ||
            Number(deuda.deudorId) !== Number(yoId)
        ) {
            return;
        }

        const gasto = gastos.find(
            (item) => Number(item.id) === Number(deuda.gastoId),
        );

        if (gasto) {
            asegurar(gasto.grupoId).miParte += Number(deuda.monto || 0);
        }
    });

    return resumen;
}

function clasificarGrupos(grupos, yoId) {
    const anfitrion = [];
    const integrante = [];

    grupos.forEach((grupo) => {
        const mio = grupo.miembros.find(
            (miembro) => Number(miembro.id) === Number(yoId),
        );

        if (mio && mio.rol === 'admin') {
            anfitrion.push(grupo);
        } else {
            integrante.push(grupo);
        }
    });

    return { anfitrion, integrante };
}

function renderizarLista(lista, grupos, etiqueta, ancla, resumen) {
    if (!lista) {
        return;
    }

    if (!grupos.length) {
        setHtml(
            lista,
            '<li class="grupo"><span class="grupo__meta">Sin grupos</span></li>',
        );

        return;
    }

    setHtml(
        lista,
        grupos
            .map((grupo) => {
                const datos = resumen.get(Number(grupo.id)) || {
                    deuda: 0,
                    miParte: 0,
                };
                const monto =
                    etiqueta === 'Deuda' ? datos.deuda : datos.miParte;

                return `<li class="grupo">
                    <a class="grupo__enlace" href="grupos.html#${ancla}">
                        <h3>${escaparHtml(grupo.nombre || 'Grupo')}</h3>
                        <p class="grupo__meta">${grupo.miembros.length} integrantes · ${etiqueta} ${formatearMonto(monto)}</p>
                        <span class="grupo__flecha" aria-hidden="true">→</span>
                    </a>
                </li>`;
            })
            .join(''),
    );
}

function renderizarTodo(grupos, deudas, gastos, yoId) {
    renderizarBalance(deudas, yoId);

    const resumen = resumenPorGrupo(gastos, deudas, yoId);
    const { anfitrion, integrante } = clasificarGrupos(grupos, yoId);
    const listas = qsa('.lista-grupos');

    renderizarLista(listas[0], anfitrion, 'Deuda', 'grupos-anfitrion', resumen);
    renderizarLista(
        listas[1],
        integrante,
        'Tu parte',
        'grupos-integrante',
        resumen,
    );
}

export function init() {
    if (!estaAutenticado()) {
        window.location.replace('login.html');

        return;
    }

    void Promise.all([
        resolverUsuarioId(),
        listarGrupos(),
        listarDeudas({ status: 'pending', per_page: 50 }),
        listarGastosCompartidos(),
    ])
        .catch(() => [null, [], [], []])
        .then(([yoId, grupos, deudas, gastos]) => {
            setGrupos(grupos);
            setDeudas(deudas);
            setGastos(gastos);
            renderizarTodo(grupos, deudas, gastos, yoId);
        });
}
