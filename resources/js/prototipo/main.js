const paginas = {
    'login.html': () => import('./usuarios/views/login.js'),
    'Registro.html': () => import('./usuarios/views/registro.js'),
    'panel-principal.html': () => import('./usuarios/views/panelPrincipal.js'),
};

function nombreDePagina() {
    const partes = window.location.pathname.split('/');

    return partes[partes.length - 1] || '';
}

async function iniciar() {
    const cargarVista = paginas[nombreDePagina()];

    if (!cargarVista) {
        return;
    }

    const vista = await cargarVista();

    if (typeof vista.init === 'function') {
        vista.init();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
} else {
    void iniciar();
}
