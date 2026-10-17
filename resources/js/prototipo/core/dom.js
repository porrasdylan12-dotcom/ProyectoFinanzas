export function qs(selector, raiz = document) {
    return raiz.querySelector(selector);
}

export function qsa(selector, raiz = document) {
    return Array.from(raiz.querySelectorAll(selector));
}

export function escaparHtml(texto) {
    return String(texto ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export function setHtml(elemento, html) {
    if (!elemento) {
        return;
    }

    if (typeof elemento.setHTMLUnsafe === 'function') {
        elemento.setHTMLUnsafe(html);
    } else {
        elemento.innerHTML = html;
    }
}

export function serializarFormulario(formulario) {
    if (!formulario) {
        return {};
    }

    return Object.fromEntries(new FormData(formulario).entries());
}

export function mostrarErrorDeCampo(input, mensaje) {
    if (!input) {
        return;
    }

    input.setAttribute('aria-invalid', 'true');

    const campo = input.closest('.campo');
    const contenedor = campo ? campo.querySelector('.campo__error') : null;

    if (!contenedor) {
        return;
    }

    if (!contenedor.dataset.mensajeOriginal) {
        contenedor.dataset.mensajeOriginal = contenedor.textContent.trim();
    }

    contenedor.textContent = mensaje;
    contenedor.style.display = 'block';
}

export function limpiarErrorDeCampo(input) {
    if (!input) {
        return;
    }

    input.removeAttribute('aria-invalid');

    const campo = input.closest('.campo');
    const contenedor = campo ? campo.querySelector('.campo__error') : null;

    if (!contenedor) {
        return;
    }

    contenedor.style.display = '';

    if (contenedor.dataset.mensajeOriginal) {
        contenedor.textContent = contenedor.dataset.mensajeOriginal;
        delete contenedor.dataset.mensajeOriginal;
    }
}

export function limpiarErroresDeFormulario(formulario) {
    if (!formulario) {
        return;
    }

    qsa('[aria-invalid="true"]', formulario).forEach(limpiarErrorDeCampo);
}

export function aplicarErroresDeValidacion(formulario, errores, mapa = {}) {
    if (!formulario || !errores) {
        return 0;
    }

    let aplicados = 0;

    Object.entries(errores).forEach(([campo, mensajes]) => {
        const nombre = mapa[campo] ?? campo;
        const input =
            formulario.elements.namedItem(nombre) ??
            formulario.querySelector(`#${nombre}`);
        const mensaje = Array.isArray(mensajes)
            ? mensajes[0]
            : String(mensajes);

        if (
            input instanceof HTMLInputElement ||
            input instanceof HTMLSelectElement ||
            input instanceof HTMLTextAreaElement
        ) {
            mostrarErrorDeCampo(input, mensaje);
            aplicados += 1;
        }
    });

    return aplicados;
}

function asegurarEstilosDinamicos() {
    if (document.querySelector('#prototipo-estilos')) {
        return;
    }

    const estilo = document.createElement('style');
    estilo.id = 'prototipo-estilos';
    estilo.textContent = `
        .formulario__aviso {
            padding: var(--espacio-2) var(--espacio-3);
            border: 1px solid var(--color-borde);
            border-radius: var(--radio-sm);
            font-size: var(--text-sm);
        }

        .formulario__aviso[data-tipo='error'] {
            color: var(--color-error-text);
            border-color: var(--color-error-text);
            background-color: rgba(193, 87, 62, 0.08);
        }

        .formulario__aviso[data-tipo='exito'] {
            color: var(--color-success);
            border-color: var(--color-success);
            background-color: rgba(111, 174, 140, 0.08);
        }

        .formulario__aviso[data-tipo='cargando'] {
            color: var(--color-text-secondary);
        }
    `;

    document.head.append(estilo);
}

export function mostrarAviso(formulario, mensaje, tipo = 'error') {
    if (!formulario) {
        return null;
    }

    asegurarEstilosDinamicos();

    let aviso = formulario.querySelector('.formulario__aviso');

    if (!aviso) {
        aviso = document.createElement('p');
        aviso.className = 'formulario__aviso';
        aviso.setAttribute('role', 'alert');
        formulario.prepend(aviso);
    }

    aviso.dataset.tipo = tipo;
    aviso.textContent = mensaje;

    return aviso;
}

export function ocultarAviso(formulario) {
    const aviso = formulario
        ? formulario.querySelector('.formulario__aviso')
        : null;

    if (aviso) {
        aviso.remove();
    }
}

export function establecerCargando(
    boton,
    cargando,
    textoCargando = 'Procesando…',
) {
    if (!boton) {
        return;
    }

    if (cargando) {
        boton.dataset.textoOriginal ??= boton.textContent.trim();
        boton.disabled = true;
        boton.textContent = textoCargando;
        return;
    }

    boton.disabled = false;

    if (boton.dataset.textoOriginal) {
        boton.textContent = boton.dataset.textoOriginal;
    }
}
