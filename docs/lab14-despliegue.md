# Laboratorio 14 – Despliegue del proyecto en un entorno operativo

**Proyecto:** Proyecto Finanzas
**Fecha:** Noviembre 2026

## 1. Objetivo

Preparar el proyecto para ejecutarse fuera del entorno de desarrollo:

- API Laravel contenerizada con Docker y desplegada en Render.
- Front-end web estático publicado en Cloudflare Workers.
- Aplicación móvil Ionic/Capacitor empaquetada como APK Android firmado mediante GitHub Actions.
- CI/CD que solo despliega o publica artefactos si las pruebas pasan.

## 2. Configuración por entornos

- `.env`: desarrollo local; no se versiona.
- `.env.example`: plantilla pública de desarrollo.
- `.env.production.example`: plantilla de producción sin secretos.
- Los secretos se cargan en Render y GitHub Actions; no se escriben en el repositorio.
- La contraseña de Aiven debe rotarse y cargarse como `DB_PASSWORD` en Render.

Variables principales de producción:

- `APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY`, `APP_URL`.
- `DB_CONNECTION=mysql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.
- `MYSQL_ATTR_SSL_CA=/var/www/html/certs/ca.pem`.
- `SESSION_DRIVER=database`, `SESSION_SECURE_COOKIE=true`.
- `QUEUE_CONNECTION=database`, `CACHE_STORE=database`.
- `CORS_ALLOWED_ORIGINS` con los orígenes del front web y móvil.
- `VITE_API_URL=https://proyectofinanzas-oqqh.onrender.com/api`.

## 3. Arquitectura de despliegue

```text
Internet
  ├── Cloudflare Workers ──► front-end estático (web-dist)
  │                              │
  │                              ▼
  └── Render ──────────────► API Laravel (/api/*, /docs, /up)
                                   │
                                   ▼
                              Aiven MySQL (SSL)

App móvil Ionic/Capacitor ──► API Laravel en Render
```

URLs previstas:

- API: `https://proyectofinanzas-oqqh.onrender.com`
- Web estática: (confirmar nombre final del Worker).
- Documentación API: `https://proyectofinanzas-oqqh.onrender.com/docs`

## 4. Contenerización

El `Dockerfile` usa build multi-etapa:

- `node:22-bookworm-slim` aporta Node/npm.
- `serversideup/php:8.4-cli` construye el front-end con `npm ci` y `npm run build`.
- La etapa final usa `serversideup/php:8.4-fpm-nginx`.
- La etapa de build usa `USER root` solo para instalar `libstdc++6` y copiar Node; la imagen final termina como `www-data`.
- `composer install --no-dev` y `composer dump-autoload --optimize --no-dev`.
- Se copian `public/build`, `resources/js/actions`, `resources/js/routes` y `resources/js/wayfinder` generados por Vite/Wayfinder.
- `AUTORUN_ENABLED=true` ejecuta al arrancar `storage:link`, `migrate --force` y `optimize`.
- `HEALTHCHECK_PATH=/up`, `NGINX_HTTP_PORT=8080`, `SSL_MODE=off`, `PHP_OPCACHE_ENABLE=1`.

El `.dockerignore` excluye `mobile/`, `tests/`, `vendor/`, `node_modules/`, assets generados, `web-dist/`, logs y cachés; conserva los `.gitignore` que mantienen los directorios de `storage` y `bootstrap/cache`.

Build local:

```bash
docker build -t proyecto-finanzas .
```

En Render el despliegue se dispara con el deploy hook del servicio; el contenedor escucha en `8080` y Render termina HTTPS.

## 5. Front-end web estático

- Fuentes: `resources/views/prototipo`, `resources/js/prototipo`, `resources/css`.
- Generador: `scripts/build-static-web.mjs`.
- Comando: `npm run build:web`.
- Salida: `web-dist/`, ignorada por Git y Docker.
- Publicación: Cloudflare Workers Static Assets con `wrangler.toml`.
- La URL de la API se inyecta en `resources/js/prototipo/core/config.js` mediante `VITE_API_URL`.

## 6. Aplicación móvil

- Proyecto independiente en `mobile/` con Ionic React, Capacitor y React 19.
- La API se consume por `src/lib/apiClient.ts` con token Sanctum en almacenamiento seguro.
- El workflow `build-android.yml` compila `assembleRelease`, sube el APK como artefacto y crea un GitHub Release.
- La firma usa variables de entorno; el keystore no se versiona.

Secrets necesarios para Android:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

## 7. CI/CD

Workflows en `.github/workflows/`:

- `tests.yml`: ejecuta `composer ci:check` y las verificaciones móviles (`lint`, `test:unit`, `build`, `test:e2e`).
- `deploy-api.yml`: tras CI exitosa en `main`/`Erick`, llama al deploy hook de Render y espera `/up`.
- `deploy-web.yml`: tras CI exitosa, genera `web-dist` y publica en Cloudflare Workers.
- `build-android.yml`: tras CI exitosa, compila y publica el APK firmado.

Los despliegues también pueden ejecutarse manualmente; en ese caso primero corren las pruebas. Si CI falla, no se despliega ni se publica el APK.

Secrets de GitHub:

- `RENDER_DEPLOY_HOOK`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

## 8. Verificación local realizada

- `composer test`: Pint PASS, PHPStan sin errores, 184 tests Pest passed.
- `npm run check`: formato y lint correctos.
- `npm run types:check`: sin errores de TypeScript.
- `npm run build`: assets de Laravel/Inertia y Wayfinder generados.
- `mobile`: lint, 192 tests unitarios, build y 6 tests e2e en verde.
- `composer validate`: `composer.json` válido; queda un warning por la restricción `*` de `spatie/laravel-permission`.
- `docker build` no se ejecutó localmente porque Docker Desktop no tiene integración WSL habilitada.

## 9. Pendientes antes del despliegue

- [ ] Rotar `DB_PASSWORD` de Aiven y cargarla en Render.
- [ ] Configurar `APP_KEY` y el resto de variables de producción en Render.
- [ ] Configurar los secrets de GitHub Actions.
- [ ] Confirmar la URL final del Worker de Cloudflare y actualizar CORS si cambia.
- [ ] Habilitar integración WSL de Docker Desktop o construir la imagen en otro entorno con Docker.
- [ ] Ejecutar `docker build` y probar el contenedor con variables de producción.
- [ ] Desplegar en Render y verificar `/up`, migraciones y HTTPS.
- [ ] Publicar el front estático y verificar navegación contra la API.
- [ ] Ejecutar `build-android.yml` y descargar el APK firmado.

## 10. Conclusión

El proyecto queda preparado para despliegue: la imagen Docker está definida, los assets se generan en build, las migraciones se ejecutan al arrancar y los workflows bloquean la publicación si fallan las pruebas. La verificación local de backend, front-end y móvil está en verde; falta ejecutar el build Docker y configurar los secretos externos.
