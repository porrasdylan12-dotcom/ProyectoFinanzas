# Decisiones móviles

## Arquitectura

- La app móvil vive en `movil/` como proyecto npm independiente con Ionic React, Capacitor y React 19.
- Toda comunicación con el backend pasa por `src/lib/apiClient.ts`; el token Sanctum se guarda solo en almacenamiento seguro.
- Las rutas privadas usan `RequireAuth`, las públicas `GuestOnly` y `/` redirige según sesión con `RootRedirect`.
- Todas las páginas se cargan con `React.lazy` + `Suspense`.

## Safe areas

- `movil/index.html` usa `viewport-fit=cover`.
- `src/theme/variables.css` expone `--app-safe-area-*` desde `env(safe-area-inset-*)` y aplica padding a `ion-content.ion-padding` y `ion-tab-bar`.
- Las pantallas de autenticación suman el inset superior e inferior en `src/pages/auth/auth.css`.
- `OfflineBanner` ya compensaba el inset superior; se mantiene como está.

## Dos tamaños

- Móvil: proyecto Playwright `Mobile Chrome` con `devices['Pixel 7']`.
- Tablet: proyecto Playwright `Tablet Chrome` con viewport `1024x768` y touch.
- El layout usa `max-width` centrado y breakpoints en `panel.css` y `grupos.css`; el login se limita a `26rem`.

## Pruebas e2e

- `e2e/app.spec.ts` cubre redirección desde `/` al login.
- `e2e/responsive.spec.ts` cubre ausencia de desbordamiento, ancho máximo del login y navegación entre pantallas de autenticación en ambos viewports.
- Los tests no dependen del backend: solo verifican render y navegación visible.

## Verificación

```bash
cd movil
npm run lint
npm run test:unit
npm run build
npm run test:e2e
```

Si Playwright falla con `EPERM` al renombrar `node_modules/.vite/deps`, borrar esa carpeta y repetir `npm run test:e2e`.
