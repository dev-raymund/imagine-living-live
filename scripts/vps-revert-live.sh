#!/usr/bin/env bash
# One-shot revert after a bad/partial deploy. Run on VPS as ROOT:
#   curl -fsSL "https://raw.githubusercontent.com/dev-raymund/imagine-living-live/main/scripts/vps-revert-live.sh" | bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/ploi/imagineliving.co.uk}"
REV="${REV:-a010e49}"
BASE="https://raw.githubusercontent.com/dev-raymund/imagine-living-live/${REV}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root (whoami must be root)." >&2
  exit 1
fi

cd "$APP_DIR"
echo "→ Reverting files from ${REV} in ${APP_DIR}"

chown -R ploi:ploi "${APP_DIR}/app" "${APP_DIR}/resources/views" 2>/dev/null || true

pull() {
  echo "  $1"
  curl -fsSL "${BASE}/$1" -o "$1"
}

pull app/Providers/AppServiceProvider.php
pull app/Console/Kernel.php
pull app/Scopes/DevelopmentsListingFilters.php
pull app/Console/Commands/SyncDevelopmentPrices.php
pull resources/views/developments.antlers.html
pull resources/views/partials/_developments-results.antlers.html
pull public/css/site.css

chown -R ploi:ploi "${APP_DIR}/app" "${APP_DIR}/resources/views" "${APP_DIR}/public/css/site.css"
chmod -R a+rX "${APP_DIR}/app"

rm -rf storage/framework/cache/data/* storage/framework/views/* 2>/dev/null || true
mkdir -p storage/framework/cache/data storage/framework/views
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

echo "→ Clear caches as ploi"
sudo -u ploi composer dump-autoload -o --no-interaction 2>/dev/null || true
sudo -u ploi php artisan config:clear
sudo -u ploi php artisan cache:clear
sudo -u ploi php artisan view:clear
sudo -u ploi php please stache:clear

php -l app/Providers/AppServiceProvider.php
echo "✓ Revert done. Test https://imagineliving.co.uk/"
