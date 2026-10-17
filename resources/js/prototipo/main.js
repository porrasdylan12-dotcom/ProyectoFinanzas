const paginas = {
    'login.html': () => import('./usuarios/views/login.js'),
    'Registro.html': () => import('./usuarios/views/registro.js'),
    'panel-principal.html': () => import('./usuarios/views/panelPrincipal.js'),
    'cuentas.html': () => import('./cuentas/views/cuentas.js'),
    'NuevaCuenta.html': () => import('./cuentas/views/NuevaCuenta.js'),
    'CrearPresupuesto.html': () =>
        import('./cuentas/views/CrearPresupuesto.js'),
    'NuevaTransaccion.html': () =>
        import('./cuentas/views/NuevaTransaccion.js'),
    'grupos.html': () => import('./grupos/views/grupos.js'),
    'CrearGrupo.html': () => import('./grupos/views/CrearGrupo.js'),
    'AnadirGasto.html': () => import('./grupos/views/AnadirGasto.js'),
    'AnadirUsuario.html': () => import('./grupos/views/AnadirUsuario.js'),
    'SaldarDeuda.html': () => import('./grupos/views/SaldarDeuda.js'),
    'AjustesUsuarios.html': () => import('./usuarios/views/ajustesUsuarios.js'),
    'RecuperarContrasena.html': () =>
        import('./usuarios/views/recuperarContrasena.js'),
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
