import { api } from '../core/index.js';

export function normalizarCuenta(datos) {
    if (!datos) {
        return null;
    }

    return {
        id: datos.id ?? null,
        nombre: datos.nombre ?? datos.name ?? '',
        tipo: datos.tipo ?? datos.type ?? '',
        saldo: datos.saldo ?? datos.balance ?? 0,
        creada: datos.creada ?? datos.created_at ?? null,
        actualizada: datos.actualizada ?? datos.updated_at ?? null,
    };
}

export function normalizarPresupuesto(datos) {
    if (!datos) {
        return null;
    }

    return {
        id: datos.id ?? null,
        nombre: datos.nombre ?? datos.name ?? '',
        categoria: datos.categoria ?? datos.category_name ?? '',
        category_id: datos.category_id ?? null,
        maximo: datos.maximo ?? datos.maxAmount ?? 0,
        gastado: datos.gastado ?? 0,
        mes: datos.mes ?? datos.month ?? null,
        anio: datos.anio ?? datos.year ?? null,
    };
}

export function normalizarTransaccion(datos) {
    if (!datos) {
        return null;
    }

    return {
        id: datos.id ?? null,
        cuenta: datos.cuenta ?? datos.account_name ?? '',
        account_id: datos.account_id ?? null,
        categoria: datos.categoria ?? datos.category_name ?? '',
        category_id: datos.category_id ?? null,
        tipo: datos.tipo ?? datos.type ?? '',
        monto: datos.monto ?? datos.amount ?? 0,
        fecha: datos.fecha ?? datos.transaction_date ?? '',
        descripcion: datos.descripcion ?? datos.description ?? '',
    };
}

export async function listarCuentas() {
    const respuesta = await api.get('/accounts');
    const items = respuesta && respuesta.data ? respuesta.data : respuesta;

    return Array.isArray(items) ? items.map(normalizarCuenta) : [];
}

export async function listarPresupuestos() {
    const respuesta = await api.get('/budgets');
    const items = respuesta && respuesta.data ? respuesta.data : respuesta;

    return Array.isArray(items) ? items.map(normalizarPresupuesto) : [];
}

export async function listarTransaccionesDeCuenta(cuentaId) {
    const respuesta = await api.get(`/accounts/${cuentaId}/transactions`);
    const items = respuesta && respuesta.data ? respuesta.data : respuesta;

    return Array.isArray(items) ? items.map(normalizarTransaccion) : [];
}

export async function crearCuenta({ name, type, balance }) {
    const respuesta = await api.post('/accounts', { name, type, balance });

    return normalizarCuenta(respuesta.data ?? respuesta);
}

export async function crearPresupuesto({
    name,
    category_id,
    maxAmount,
    month,
    year,
}) {
    const respuesta = await api.post('/budgets', {
        name,
        category_id,
        maxAmount,
        month,
        year,
    });

    return normalizarPresupuesto(respuesta.data ?? respuesta);
}

export async function crearTransaccion({
    account_id,
    type,
    category_id,
    amount,
    transaction_date,
    description,
}) {
    const respuesta = await api.post('/transactions', {
        account_id,
        type,
        category_id,
        amount,
        transaction_date,
        description: description || null,
    });

    return normalizarTransaccion(respuesta.data ?? respuesta);
}

export async function listarCategorias() {
    const respuesta = await api.get('/categories');
    const items = respuesta && respuesta.data ? respuesta.data : respuesta;

    return Array.isArray(items) ? items : [];
}
