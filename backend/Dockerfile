# Dockerfile untuk Laravel Backend dengan PostgreSQL
FROM php:8.2-fpm-alpine

# Install Nginx dan dependensi sistem
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    postgresql-client \
    oniguruma-dev \
    linux-headers \
    nginx \
    $PHPIZE_DEPS

# Install ekstensi PHP
RUN docker-php-ext-install pdo pdo_pgsql pgsql mbstring exif pcntl bcmath gd xml

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set direktori kerja
WORKDIR /var/www/html

# Salin file composer
COPY composer.json composer.lock ./

# Install dependensi
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Salin file aplikasi
COPY . .

# Generate file autoload
RUN composer dump-autoload --optimize --no-dev

# Salin konfigurasi Nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# Set izin
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Buat script untuk menjalankan Nginx dan PHP-FPM
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'set -e' >> /start.sh && \
    echo 'cd /var/www/html' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Buat .env dari .env.example jika belum ada' >> /start.sh && \
    echo 'if [ ! -f ".env" ]; then' >> /start.sh && \
    echo '  if [ -f ".env.example" ]; then' >> /start.sh && \
    echo '    cp .env.example .env' >> /start.sh && \
    echo '  fi' >> /start.sh && \
    echo 'fi' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Generate APP_KEY jika belum ada' >> /start.sh && \
    echo 'if [ -z "$APP_KEY" ]; then' >> /start.sh && \
    echo '  php artisan key:generate --force || true' >> /start.sh && \
    echo 'fi' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Permission' >> /start.sh && \
    echo 'chown -R www-data:www-data storage bootstrap/cache' >> /start.sh && \
    echo 'chmod -R ug+rwx storage bootstrap/cache' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Storage symlink' >> /start.sh && \
    echo 'php artisan storage:link || true' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Cache config/views/routes' >> /start.sh && \
    echo 'php artisan config:cache || true' >> /start.sh && \
    echo 'php artisan route:cache || true' >> /start.sh && \
    echo 'php artisan view:cache || true' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Migrate jika diminta' >> /start.sh && \
    echo 'if [ "$RUN_MIGRATIONS" = "true" ]; then' >> /start.sh && \
    echo '  php artisan migrate --force || true' >> /start.sh && \
    echo 'fi' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Jalankan PHP-FPM dan Nginx' >> /start.sh && \
    echo 'php-fpm -D' >> /start.sh && \
    echo 'echo "Laravel application started on port 8888"' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Expose port 8888 (sesuai dengan nginx.conf)
EXPOSE 8888

# Jalankan script start
CMD ["/start.sh"]
