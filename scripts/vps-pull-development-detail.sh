#!/usr/bin/env bash
# Run on the VPS as user ploi (pull development detail + preview from GitHub main).
#   cd /home/ploi/imagineliving.co.uk
#   curl -fsSL "https://raw.githubusercontent.com/dev-raymund/imagine-living-live/main/scripts/vps-pull-development-detail.sh" -o /tmp/vps-pull-development-detail.sh
#   bash /tmp/vps-pull-development-detail.sh dev-raymund imagine-living-live
# Never run as root.

set -euo pipefail

GITHUB_USER="${1:-dev-raymund}"
GITHUB_REPO="${2:-imagine-living-live}"
BRANCH="${3:-main}"
BASE="https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${BRANCH}"

APP_DIR="${APP_DIR:-/home/ploi/imagineliving.co.uk}"
cd "$APP_DIR"

mkdir -p app/Scopes app/Console/Commands
mkdir -p resources/fieldsets
mkdir -p resources/views/components/showcasecard
mkdir -p resources/views/components/developments
mkdir -p resources/blueprints/collections/developments
mkdir -p content/collections/pages
mkdir -p content/collections/developments
mkdir -p content/trees/collections
mkdir -p public/css

pull() {
    local rel="$1"
    echo "→ $rel"
    curl -fsSL "${BASE}/${rel}" -o "${rel}"
}

pull app/Scopes/DevelopmentsPreviewListingFilters.php
pull app/Console/Commands/ClearDevelopmentDetailFields.php
pull app/Console/Commands/DisableDevelopmentDetailPages.php
pull app/Console/Commands/EnableDevelopmentDetailPages.php
pull app/Console/Commands/SeedPreviewDevelopmentExamples.php
pull resources/blueprints/collections/developments/development.yaml
pull content/collections/developments.yaml
pull resources/fieldsets/development_detail.yaml
pull resources/fieldsets/property_unit.yaml
pull resources/views/development-detail.antlers.html
pull resources/views/developments-preview.antlers.html
pull resources/views/components/showcasecard/_showcase-card-detail.antlers.html
pull resources/views/components/showcasecard/_showcase-card.antlers.html
pull resources/views/components/showcasecard/_showcase-card-specs.antlers.html
pull resources/views/components/showcasecard/showcaseCard.css
pull resources/views/components/developments/_development-sidebar-cta.antlers.html
pull resources/views/components/developments/_development-property-unit-card.antlers.html
pull resources/views/components/developments/_development-panel-templates.antlers.html
pull resources/views/components/developments/_development-unit-specs.antlers.html
pull resources/views/components/developments/_development-property-card.antlers.html
pull resources/views/components/developments/developmentDetail.css
pull resources/views/components/developments/developmentDetail.js
pull content/collections/pages/developments-preview.md
pull content/trees/collections/pages.yaml
pull public/site.generated.css
pull public/site.js
pull public/css/site.css

PREVIEW_DEVELOPMENTS=(
  content/collections/developments/a-cityview-point.md
  content/collections/developments/a-bow-green.md
  content/collections/developments/a-ark-house.md
  content/collections/developments/a-east-thames-house.md
  content/collections/developments/a-portway-house.md
  content/collections/developments/a-rigel-house.md
  content/collections/developments/a-vincent-wharf.md
  content/collections/developments/a-ymcc-house.md
  content/collections/developments/east-thames-house.md
  content/collections/developments/regent-place.md
)

for entry in "${PREVIEW_DEVELOPMENTS[@]}"; do
  pull "$entry"
done

echo "→ composer + caches"
composer dump-autoload -o --no-interaction
php artisan developments:clear-detail-fields
php please stache:clear
php artisan view:clear
php artisan cache:clear

echo "✓ Done. Check:"
echo "  /developments-preview"
echo "  /developments/a-cityview-point"
