const PREFIJO = 'finanzas_borrador_';

function nombreDePagina() {
    const partes = window.location.pathname.split('/');

    return partes[partes.length - 1] || 'pagina';
}

function claveDeBorrador(idFormulario) {
    return idFormulario
        ? `${PREFIJO}${nombreDePagina()}_${idFormulario}`
        : `${PREFIJO}${nombreDePagina()}`;
}

function almacen() {
    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
}

export function guardarBorrador(idFormulario = '', entradas) {
    const storage = almacen();

    if (!storage) {
        return;
    }

    try {
        const clave = claveDeBorrador(idFormulario);

        if (!entradas || entradas.length === 0) {
            storage.removeItem(clave);
        } else {
            storage.setItem(clave, JSON.stringify(entradas));
        }
    } catch {}
}

export function leerBorrador(idFormulario = '') {
    const storage = almacen();

    if (!storage) {
        return null;
    }

    try {
        const crudo = storage.getItem(claveDeBorrador(idFormulario));

        return crudo ? JSON.parse(crudo) : null;
    } catch {
        return null;
    }
}

export function limpiarBorrador(idFormulario = '') {
    const storage = almacen();

    if (!storage) {
        return;
    }

    try {
        storage.removeItem(claveDeBorrador(idFormulario));
    } catch {}
}

function restaurarCampo(control, valor) {
    if (control instanceof HTMLInputElement) {
        if (control.type === 'checkbox' || control.type === 'radio') {
            control.checked = String(valor) === control.value;

            return;
        }

        control.value = String(valor);

        return;
    }

    if (
        control instanceof HTMLSelectElement ||
        control instanceof HTMLTextAreaElement
    ) {
        control.value = String(valor);
    }
}

function restaurarEntradas(entradas, formulario) {
    if (!Array.isArray(entradas) || !formulario) {
        return;
    }

    entradas.forEach(([nombre, valor]) => {
        const campo = formulario.elements.namedItem(nombre);

        if (!campo) {
            return;
        }

        const controles =
            campo instanceof RadioNodeList ? Array.from(campo) : [campo];

        controles.forEach((control) => restaurarCampo(control, valor));
    });
}

export function conectarBorrador(formulario, idFormulario = '') {
    if (!formulario) {
        return () => {};
    }

    const restaurar = () =>
        restaurarEntradas(leerBorrador(idFormulario), formulario);

    const guardar = () =>
        guardarBorrador(
            idFormulario,
            Array.from(new FormData(formulario).entries()),
        );

    restaurar();

    formulario.addEventListener('input', guardar);
    formulario.addEventListener('change', guardar);

    return restaurar;
}
