import { api } from '../core/index.js';
import { usuarioActual } from '../usuarios/state.js';

export function normalizarMiembro(datos) {
    if (!datos) {
        return null;
    }

    return {
        id: datos.id ?? null,
        nombre: datos.nombre ?? datos.name ?? '',
        email: datos.email ?? '',
        rol: datos.rol ?? datos.role ?? '',
        fechaIngreso: datos.fecha_ingreso ?? null,
    };
}

export function normalizarGrupo(datos) {
    if (!datos) {
        return null;
    }

    return {
        id: datos.id ?? null,
        nombre: datos.nombre ?? datos.name ?? '',
        miembros: Array.isArray(datos.miembros)
            ? datos.miembros.map(normalizarMiembro)
            : [],
        creada: datos.creada ?? null,
        actualizada: datos.actualizada ?? null,
    };
}

export function normalizarDeuda(datos) {
    if (!datos) {
        return null;
    }

    return {
        id: datos.id ?? null,
        gastoId: datos.gasto_compartido_id ?? datos.shared_expense_id ?? null,
        deudorId: datos.deudor_id ?? datos.debtor_id ?? null,
        acreedorId: datos.acreedor_id ?? datos.creditor_id ?? null,
        monto: datos.monto_total ?? datos.total_amount ?? 0,
        estado: datos.estado ?? datos.status ?? '',
        creada: datos.creada ?? null,
        actualizada: datos.actualizada ?? null,
    };
}

export function normalizarGasto(datos) {
    if (!datos) {
        return null;
    }

    return {
        id: datos.id ?? null,
        grupoId: datos.grupo_id ?? datos.group_id ?? null,
        usuarioId: datos.usuario_id ?? datos.user_id ?? null,
        monto: datos.monto ?? datos.amount ?? 0,
        descripcion: datos.descripcion ?? datos.description ?? '',
        fecha: datos.fecha ?? datos.date ?? '',
        participantes: datos.participantes ?? datos.participants ?? [],
        deudas: Array.isArray(datos.deudas)
            ? datos.deudas.map(normalizarDeuda)
            : [],
    };
}

function extraerColeccion(respuesta) {
    return respuesta && respuesta.data ? respuesta.data : respuesta;
}

export async function listarGrupos() {
    const items = extraerColeccion(await api.get('/groups'));

    return Array.isArray(items) ? items.map(normalizarGrupo) : [];
}

export async function listarDeudas(filtros = {}) {
    const items = extraerColeccion(
        await api.get('/group-debts', { query: filtros }),
    );

    return Array.isArray(items) ? items.map(normalizarDeuda) : [];
}

export async function listarGastosCompartidos() {
    const items = extraerColeccion(await api.get('/shared-expenses'));

    return Array.isArray(items) ? items.map(normalizarGasto) : [];
}

export async function crearGrupo({ name }) {
    const respuesta = await api.post('/groups', { name });

    return normalizarGrupo(extraerColeccion(respuesta));
}

export async function agregarMiembro(grupoId, { email }) {
    const respuesta = await api.post(`/groups/${grupoId}/members`, { email });

    return normalizarGrupo(extraerColeccion(respuesta));
}

export async function crearGastoCompartido({
    group_id,
    amount,
    date,
    description,
    participants,
}) {
    const respuesta = await api.post(`/groups/${group_id}/shared-expenses`, {
        amount,
        date,
        description: description || null,
        participants,
    });

    return normalizarGasto(extraerColeccion(respuesta));
}

export async function saldarDeuda(deuda) {
    const respuesta = await api.patch(`/group-debts/${deuda.id}`, {
        shared_expense_id: deuda.gastoId,
        debtor_id: deuda.deudorId,
        creditor_id: deuda.acreedorId,
        total_amount: Number(deuda.monto),
        status: 'paid',
    });

    return normalizarDeuda(extraerColeccion(respuesta));
}

export async function obtenerUsuarioActual() {
    const respuesta = await api.get('/user');

    return extraerColeccion(respuesta);
}

export async function resolverUsuarioId() {
    const usuario = usuarioActual();

    if (usuario && usuario.id) {
        return usuario.id;
    }

    const datos = await obtenerUsuarioActual();

    return datos ? datos.id : null;
}
