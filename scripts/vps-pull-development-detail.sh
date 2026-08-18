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

# raw.githubusercontent.com returns the odd transient 502. Without a retry that
# aborts the whole run under `set -e`, leaving the server half-updated, so give
# each file three attempts before giving up.
pull() {
    local rel="$1"
    local attempt
    echo "→ $rel"
    for attempt in 1 2 3; do
        if curl -fsSL --retry 2 --retry-delay 2 "${BASE}/${rel}" -o "${rel}"; then
            return 0
        fi
        echo "   retry ${attempt}/3 after transient failure"
        sleep 3
    done
    echo "   FAILED: ${rel}" >&2
    return 1
}

pull app/Scopes/DevelopmentsListingFilters.php
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
# The developments-preview page entry and the pages tree are NOT pulled.
# Re-copying them republishes the staging listing and overwrites the live page
# tree, dropping any page added in the control panel since.
pull public/site.generated.css
pull public/site.js
pull public/css/site.css
# The live layout references /css/site.css and /js/site.js, so both synced
# copies must ship - not just the Parcel output at public root.
pull public/js/site.js

# Development entries are NOT pulled. This script used to copy ten of them from
# the repo onto the server, which overwrote live entries with seeded example
# data (invented rents, "Local station", "example detail content") and created
# duplicate (A)-prefixed entries for slugs that only exist locally. Developments
# are edited in the live control panel; the server is their source of truth.

# developments:clear-detail-fields is NOT run here either. Without an explicit
# --except matching a live slug it strips the detail content off every entry,
# including curated ones. Run it by hand when you actually mean to reset.

echo "→ composer + caches"
composer dump-autoload -o --no-interaction
php please stache:clear
php artisan view:clear
php artisan cache:clear

echo "✓ Done. Check:"
echo "  /developments"
echo "  /developments/cityview-point"
