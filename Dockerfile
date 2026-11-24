FROM node:22-bookworm-slim AS node

FROM serversideup/php:8.4-cli AS frontend

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/bin/npm /usr/local/bin/npm
COPY --from=node /usr/local/bin/npx /usr/local/bin/npx
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules

WORKDIR /var/www/html/backend

COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction --prefer-dist

COPY backend . .
RUN cp .env.example .env \
    && composer dump-autoload --optimize --no-dev

WORKDIR /var/www/html/web

COPY web/package.json web/package-lock.json web/.npmrc ./
RUN npm ci

COPY web . .
RUN npm run build

FROM serversideup/php:8.4-fpm-nginx

ENV APP_ENV=production \
    APP_DEBUG=false \
    APP_BASE_DIR=/var/www/html/backend \
    NGINX_WEBROOT=/var/www/html/backend/public \
    PHP_OPCACHE_ENABLE=1 \
    AUTORUN_ENABLED=true \
    HEALTHCHECK_PATH=/up \
    NGINX_HTTP_PORT=8080 \
    SSL_MODE=off

WORKDIR /var/www/html/backend

COPY --chown=www-data:www-data backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction --prefer-dist

COPY --chown=www-data:www-data backend . .
COPY --chown=www-data:www-data docs ../docs
COPY --from=frontend --chown=www-data:www-data /var/www/html/backend/public/build ./public/build
COPY --from=frontend --chown=www-data:www-data /var/www/html/web/resources ../web/resources

RUN composer dump-autoload --optimize --no-dev && php artisan package:discover --ansi

USER www-data
