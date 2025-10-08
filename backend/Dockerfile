# Backend (Laravel - PHP-FPM)
FROM php:8.2-fpm-alpine

# Install extensi & tools
RUN apk add --no-cache git zip unzip libpq-dev icu-dev oniguruma-dev \
  && docker-php-ext-install intl mbstring bcmath \
  && docker-php-ext-install pdo_pgsql

# Tambahkan Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy source code
COPY . /var/www/html

# EntryPoint untuk install deps dan jalankan artisan opsional
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Permission untuk storage & cache
RUN mkdir -p storage bootstrap/cache \
  && chown -R www-data:www-data /var/www/html

EXPOSE 9000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm", "-F"]