\#Laboratorio 14 – Despliegue del proyecto en un entorno operativo



\*\*Proyecto:\*\* Proyecto Finanzas  

\*\*Fecha:\*\* Noviembre 2026  

\*\*Equipo:\*\* \[Escribe aquí los nombres del equipo]



\---



\## 1. Objetivos cumplidos



\- Empaquetar la aplicación para un entorno distinto al de desarrollo.

\- Desplegar la aplicación web en un entorno operativo accesible desde Internet.

\- Preparar el paquete de la aplicación móvil para su distribución.



\---



\## 2. Configuración por entornos



Se separaron claramente los entornos de \*\*desarrollo\*\* y \*\*producción\*\*:



\- Archivo `.env` → solo para desarrollo local (nunca se sube al repositorio).

\- Archivo `.env.example` → plantilla pública.

\- Archivo `.env.production.example` → plantilla de producción (sin secretos).



\*\*Ninguna credencial\*\* (contraseñas, APP\_KEY, tokens, etc.) está en el código fuente ni en el repositorio.  

Todas las variables sensibles se configuran mediante \*\*variables de entorno\*\* en la plataforma de despliegue (Render).



Si falta alguna variable crítica en producción, la aplicación falla de forma explícita.



\---



\## 3. Empaquetado y tamaños de artefactos



\### Backend (producción)

```bash

composer install --no-dev --optimize-autoloader

```

\- Tamaño de `vendor/`: \*\*≈ 38.36 MB\*\*



\### Frontend (producción)

```bash pnpm run build ```

\- Tamaño de `public/build/`: \*\*≈ 1.30 MB\*\*



\---



\## 4. Contenerización



Se utilizó un \*\*Dockerfile multi-stage\*\* con las siguientes características:



\- Construcción en múltiples etapas (Node para el frontend + PHP para el backend).

\- Imagen base mínima: `serversideup/php:8.4-fpm-nginx`.

\- El contenedor \*\*no se ejecuta como administrador\*\* (usuario `www-data`).

\- Healthcheck configurado en la ruta `/up`.



\---



\## 5. Arquitectura de despliegue



```

Internet

&#x20;  │

&#x20;  ▼

\[Render.com] ──────────► Backend (Laravel + Inertia)

&#x20;  │                         │

&#x20;  │                         ▼

&#x20;  │                    \[Aiven MySQL] (Base de datos)

&#x20;  │

&#x20;  └──► Certificado HTTPS automático

```



\- \*\*Backend + Frontend\*\*: Render (usando Docker)

\- \*\*Base de datos\*\*: Aiven MySQL (con SSL)

\- \*\*Aplicación móvil\*\*: Capacitor (Android)



\### Variables de entorno principales en producción

\- `APP\_ENV=production`

\- `APP\_DEBUG=false`

\- `DB\_\*` (conexión a Aiven)

\- `APP\_KEY`

\- `SESSION\_SECURE\_COOKIE=true`



\---



\## 6. Integración y entrega continuas (CI/CD)



Se configuró un flujo automatizado con GitHub Actions:



1\. Al hacer push a la rama `main`:

&#x20;  - Se ejecuta la compilación

&#x20;  - Se ejecuta la suite de pruebas (backend + mobile)

2\. \*\*Solo si todas las pruebas pasan\*\*, se despliega automáticamente a Render.

3\. Si alguna prueba falla → el despliegue se detiene.



\*\*Evidencias:\*\*

\- Ejecución exitosa: (pegar captura aquí)

\- Ejecución detenida por prueba fallida: (pegar captura aquí)



\---



\## 7. Paquete móvil firmado



Se generó el paquete de distribución de Android firmado con keystore propio.



\- Ubicación del APK: `mobile/android/app/build/outputs/apk/release/app-release.apk`

\- Firmado con keystore de producción.



\---



\## 8. Verificación del despliegue



\- \[ ] Aplicación accesible públicamente

\- \[ ] Certificado HTTPS válido

\- \[ ] Variables sensibles no expuestas

\- \[ ] Endpoint de verificación de estado (`/up`) responde correctamente

\- \[ ] Migraciones ejecutadas en producción



\*\*URL pública de la aplicación:\*\*  

https://proyectofinanzas-oqqh.onrender.com



\---



\## 9. Conclusión



El proyecto cumple con todos los requisitos del Laboratorio 14:

\- Separación clara de entornos

\- Contenerización optimizada y segura

\- Despliegue funcional

\- CI/CD con control de calidad

\- Paquete móvil firmado

\- Documentación completa

```



