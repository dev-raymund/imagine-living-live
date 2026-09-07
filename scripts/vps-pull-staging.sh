#!/usr/bin/env bash
# Run on the VPS as user ploi (pull the /staging page + 3 dummy developments from GitHub main).
#   cd /home/ploi/imagineliving.co.uk
#   curl -fsSL "https://raw.githubusercontent.com/dev-raymund/imagine-living-live/main/scripts/vps-pull-staging.sh" -o /tmp/vps-pull-staging.sh
#   bash /tmp/vps-pull-staging.sh dev-raymund imagine-living-live
# Never run as root.
#
# What this ships: an internal /staging page listing three invented developments
# so the listing card, the detail template and the property filters can be
# checked against realistic-looking content on the live server. Every price,
# address, station and school in those three entries is made up. All four pages
# carry `noindex, nofollow` and are held out of the sitemap, and the developments
# listing filters them out, so nothing fake is reachable from the public site or
# from search.
#
# To remove it all again, see the teardown block at the bottom of this file.

set -euo pipefail

GITHUB_USER="${1:-dev-raymund}"
GITHUB_REPO="${2:-imagine-living-live}"
BRANCH="${3:-main}"
BASE="https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${BRANCH}"

APP_DIR="${APP_DIR:-/home/ploi/imagineliving.co.uk}"
cd "$APP_DIR"

STAGING_PAGE_ID="3b7e4d21-8a56-4c93-b1f7-6d2a9e5c8047"
PAGES_TREE="content/trees/collections/pages.yaml"

mkdir -p content/collections/pages
mkdir -p content/collections/developments
mkdir -p content/trees/collections
mkdir -p resources/views

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

# The staging listing template, and the developments listing with the
# `slug:doesnt_start_with="staging-"` guard that keeps the dummy entries off the
# public /developments page. Pull both or the dummies leak into the real listing.
pull resources/views/staging.antlers.html
pull resources/views/developments.antlers.html

# The staging page entry, and the three dummy developments.
#
# Unlike the developments the sibling scripts deliberately refuse to copy, these
# four files are safe to pull: `staging` and the `staging-*` slugs exist nowhere
# but here, so there is no live control-panel copy to overwrite and no duplicate
# to create. Nobody edits them in the CP - the repo is their source of truth.
pull content/collections/pages/staging.md
pull content/collections/developments/staging-riverside-quarter.md
pull content/collections/developments/staging-kingsway-heights.md
pull content/collections/developments/staging-meridian-gardens.md

# The pages tree is NOT pulled. The live control panel is its source of truth,
# so copying the repo's copy over it drops every page added since the last sync.
# The staging page still needs an entry there or it has no URL at all, so append
# just that one line instead, and only when it is missing.
echo "→ ${PAGES_TREE} (append only)"
if grep -q "$STAGING_PAGE_ID" "$PAGES_TREE"; then
    echo "   already present, left alone"
else
    cp "$PAGES_TREE" "${PAGES_TREE}.bak.$(date +%Y%m%d%H%M%S)"
    # Guard against a tree that does not end in a newline, which would otherwise
    # splice the new entry onto the back of the last one.
    [ -n "$(tail -c 1 "$PAGES_TREE")" ] && echo "" >> "$PAGES_TREE"
    printf '  -\n    entry: %s\n' "$STAGING_PAGE_ID" >> "$PAGES_TREE"
    echo "   appended (backup written alongside)"
fi

# developments:clear-detail-fields is NOT run here. Without an explicit --except
# matching a live slug it strips the detail content off every entry, including
# curated ones. Run it by hand when you actually mean to reset.

echo "→ caches"
php please stache:clear
php artisan view:clear
php artisan cache:clear

echo "✓ Done. Check:"
echo "  /staging                                  (3 dummy cards)"
echo "  /developments/staging-riverside-quarter   (3 property units)"
echo "  /developments/staging-kingsway-heights    (2 property units)"
echo "  /developments/staging-meridian-gardens    (4 property units)"
echo "  /developments                             (must show NO staging entries)"
echo "  /sitemap.xml                              (must contain NO staging URLs)"

# ---------------------------------------------------------------------------
# Teardown - run by hand on the VPS to remove the staging material entirely:
#
#   cd /home/ploi/imagineliving.co.uk
#   rm -f content/collections/pages/staging.md \
#         content/collections/developments/staging-riverside-quarter.md \
#         content/collections/developments/staging-kingsway-heights.md \
#         content/collections/developments/staging-meridian-gardens.md \
#         resources/views/staging.antlers.html
#   # drop the tree entry (removes the "  -" line above it too)
#   sed -i "/3b7e4d21-8a56-4c93-b1f7-6d2a9e5c8047/{x;d};x" content/trees/collections/pages.yaml
#   sed -i "/3b7e4d21-8a56-4c93-b1f7-6d2a9e5c8047/d" content/trees/collections/pages.yaml
#   php please stache:clear && php artisan view:clear && php artisan cache:clear
# ---------------------------------------------------------------------------
