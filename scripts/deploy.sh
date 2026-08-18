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

# NOTE: developments:clear-detail-fields is deliberately NOT run here.
# It strips `template` and every detail field from all entries except
# a-cityview-point, which would undo the detail pages on every deploy now
# that developments opt in via the Template field. Run it by hand if you
# ever need to reset an entry.

echo "→ Clear caches"
php please stache:clear
php artisan cache:clear
php artisan view:clear

echo "✓ Deploy complete"
