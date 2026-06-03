#!/usr/bin/env bash
# Run on the VPS as user ploi (after files are on YOUR GitHub).
# Example:
#   su - ploi
#   cd imagineliving.co.uk
#   curl -fsSL "https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/scripts/vps-pull-filters.sh" | bash -s YOUR_USER YOUR_REPO

set -euo pipefail

GITHUB_USER="${1:-YOUR_GITHUB_USERNAME}"
GITHUB_REPO="${2:-YOUR_REPO_NAME}"
BRANCH="${3:-main}"
BASE="https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${BRANCH}"

APP_DIR="${APP_DIR:-/home/ploi/imagineliving.co.uk}"
cd "$APP_DIR"

mkdir -p app/Scopes app/Console/Commands app/Providers
mkdir -p resources/views/partials
mkdir -p resources/blueprints/collections/developments

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

echo "→ rebuild CSS on server (if npm available) or upload public/css/site.css from your PC"
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
