FROM node:22-bookworm-slim AS node

FROM serversideup/php:8.4-cli AS frontend

COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/bin/npm /usr/local/bin/npm
COPY --from=node /usr/local/bin/npx /usr/local/bin/npx
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction --prefer-dist

COPY . .
RUN cp .env.example .env \
    && composer dump-autoload --optimize --no-dev \
    && npm ci \
    && npm run build

FROM serversideup/php:8.4-fpm-nginx

ENV APP_ENV=production \
    APP_DEBUG=false \
    PHP_OPCACHE_ENABLE=1 \
    AUTORUN_ENABLED=true \
    HEALTHCHECK_PATH=/up \
    NGINX_HTTP_PORT=8080

WORKDIR /var/www/html

COPY --chown=www-data:www-data composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction --prefer-dist

COPY --chown=www-data:www-data . .
COPY --from=frontend --chown=www-data:www-data /var/www/html/public/build ./public/build
COPY --from=frontend --chown=www-data:www-data /var/www/html/resources/js/actions ./resources/js/actions
COPY --from=frontend --chown=www-data:www-data /var/www/html/resources/js/routes ./resources/js/routes
COPY --from=frontend --chown=www-data:www-data /var/www/html/resources/js/wayfinder ./resources/js/wayfinder

RUN composer dump-autoload --optimize --no-dev && php artisan package:discover --ansi

USER www-data
