const estadoInicial = {
    cuentas: [],
    presupuestos: [],
    transacciones: [],
    cuentaSeleccionada: null,
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
            console.error('Error en suscriptor cuentas:', error);
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

export function setCuentaSeleccionada(cuenta) {
    return setState({ cuentaSeleccionada: cuenta });
}

export async function ejecutar(accion, mensajeExito) {
    setState({ cargando: true, errores: {}, mensaje: null });

    try {
        const resultado = await accion();

        if (mensajeExito) {
            setState({ mensaje: mensajeExito });
        }

        return resultado;
    } catch (error) {
        setState({
            errores: error && error.errors ? error.errors : {},
            mensaje: error && error.message ? error.message : null,
        });
        throw error;
    } finally {
        setState({ cargando: false });
    }
}
