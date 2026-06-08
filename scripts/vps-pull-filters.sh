#!/usr/bin/env bash
# Run on the VPS as user ploi (pull filter updates from GitHub main).
#   cd /home/ploi/imagineliving.co.uk
#   curl -fsSL "https://raw.githubusercontent.com/dev-raymund/imagine-living-live/main/scripts/vps-pull-filters.sh" -o /tmp/vps-pull-filters.sh
#   bash /tmp/vps-pull-filters.sh dev-raymund imagine-living-live
# Never run as root.

set -euo pipefail

GITHUB_USER="${1:-YOUR_GITHUB_USERNAME}"
GITHUB_REPO="${2:-YOUR_REPO_NAME}"
BRANCH="${3:-main}"
BASE="https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${BRANCH}"

APP_DIR="${APP_DIR:-/home/ploi/imagineliving.co.uk}"
cd "$APP_DIR"

mkdir -p app/Scopes app/Console/Commands app/Providers
mkdir -p resources/views/partials
mkdir -p resources/views/components/developments
mkdir -p resources/views/components/showcasecard
mkdir -p resources/blueprints/collections/developments
mkdir -p public/css

pull() {
    local rel="$1"
    echo "→ $rel"
    curl -fsSL "${BASE}/${rel}" -o "${rel}"
}

pull app/Scopes/DevelopmentsListingFilters.php
pull app/Console/Commands/SyncDevelopmentPrices.php
pull app/Console/Kernel.php
pull app/Providers/AppServiceProvider.php
pull resources/views/developments.antlers.html
pull resources/views/partials/_developments-results.antlers.html
pull resources/views/components/developments/developmentsFilter.css
pull resources/views/components/showcasecard/developmentsResults.css
pull resources/blueprints/collections/developments/development.yaml
pull public/css/site.css

echo "→ rebuild CSS on server (optional; site.css already pulled from GitHub)"
if command -v npm >/dev/null 2>&1 && [ -f package.json ]; then
  npm run build:css --silent 2>/dev/null || true
fi

echo "→ composer + caches"
composer dump-autoload -o --no-interaction
php artisan developments:sync-prices
php please stache:clear
php artisan view:clear
php artisan cache:clear

echo "✓ Done. Check /developments on the site."
