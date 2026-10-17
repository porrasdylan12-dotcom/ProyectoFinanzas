const estadoInicial = {
    grupos: [],
    deudas: [],
    gastos: [],
    grupoSeleccionado: null,
    cargando: false,
    errores: {},
    mensaje: null,
};

let estado = { ...estadoInicial };

const oyentes = new Set();

function notificar() {
    oyentes.forEach((oyente) => {
        try {
            oyente(estado);
        } catch (error) {
            console.error('Error en suscriptor grupos:', error);
        }
    });
}

function setState(patch) {
    const siguiente = typeof patch === 'function' ? patch(estado) : patch;
    estado = { ...estado, ...siguiente };
    notificar();
    return estado;
}

export function suscribir(oyente) {
    oyentes.add(oyente);
    oyente(estado);

    return () => {
        oyentes.delete(oyente);
    };
}

export function getState() {
    return estado;
}

export function setGrupos(grupos) {
    return setState({ grupos: Array.isArray(grupos) ? grupos : [] });
}

export function setDeudas(deudas) {
    return setState({ deudas: Array.isArray(deudas) ? deudas : [] });
}

export function setGastos(gastos) {
    return setState({ gastos: Array.isArray(gastos) ? gastos : [] });
}

export function setGrupoSeleccionado(grupo) {
    return setState({ grupoSeleccionado: grupo });
}

export function ejecutar(accion, mensajeExito) {
    setState({ cargando: true, errores: {}, mensaje: null });

    return accion()
        .then((resultado) => {
            if (mensajeExito) {
                setState({ mensaje: mensajeExito });
            }
            return resultado;
        })
        .catch((error) => {
            setState({
                errores: error && error.errors ? error.errors : {},
                mensaje: error && error.message ? error.message : null,
            });
            throw error;
        })
        .finally(() => {
            setState({ cargando: false });
        });
}
