#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/ploi/imagineliving.co.uk}"

cd "$APP_DIR"

echo "→ Composer"
composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-reqs

echo "→ Frontend build"
npm ci
npm run build

echo "→ Sync development prices (if command exists)"
php artisan developments:sync-prices || true

echo "→ Clear caches"
php please stache:clear
php artisan cache:clear
php artisan view:clear

echo "✓ Deploy complete"
