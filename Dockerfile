FROM node:22-bookworm-slim AS node

FROM serversideup/php:8.4-cli AS build

USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

WORKDIR /var/www

COPY backend/composer.json backend/composer.lock ./backend/
RUN cd backend \
    && composer install --no-dev --no-scripts --no-autoloader --no-interaction --prefer-dist

COPY backend/ ./backend/
COPY web/ ./web/
COPY docs/ ./docs/

RUN cd backend \
    && cp .env.example .env \
    && composer dump-autoload --optimize --no-dev \
    && php artisan key:generate --force

WORKDIR /var/www/web
RUN npm ci && npm run build

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

COPY --chown=www-data:www-data backend/ ./
COPY --from=build --chown=www-data:www-data /var/www/backend/vendor ./vendor
COPY --from=build --chown=www-data:www-data /var/www/backend/bootstrap/cache ./bootstrap/cache
COPY --from=build --chown=www-data:www-data /var/www/backend/public/build ./public/build
COPY --from=build --chown=www-data:www-data /var/www/web/resources /var/www/html/web/resources
COPY --chown=www-data:www-data docs/ /var/www/html/docs/

USER www-data
