#!/usr/bin/env bash
# Upload only developments search/sort/filter changes to the VPS.
# Run from your PC (Git Bash or WSL), not on the server.
set -euo pipefail

HOST="${DEPLOY_HOST:-77.68.64.22}"
USER="${DEPLOY_USER:-ploi}"
REMOTE="${DEPLOY_PATH:-/home/ploi/imagineliving.co.uk}"
SSH_KEY="${DEPLOY_KEY:-$HOME/.ssh/imagineliving_deploy}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

FILES=(
  app/Scopes/DevelopmentsListingFilters.php
  app/Console/Commands/SyncDevelopmentPrices.php
  app/Console/Kernel.php
  app/Providers/AppServiceProvider.php
  resources/views/developments.antlers.html
  resources/views/partials/_developments-results.antlers.html
  resources/blueprints/collections/developments/development.yaml
)

RSYNC_SSH="ssh -i ${SSH_KEY} -o StrictHostKeyChecking=accept-new"

echo "→ Syncing filter feature files to ${USER}@${HOST}:${REMOTE}"
for rel in "${FILES[@]}"; do
  src="${ROOT}/${rel}"
  if [[ ! -f "$src" ]]; then
    echo "Missing: $src" >&2
    exit 1
  fi
  rsync -avz -e "$RSYNC_SSH" "$src" "${USER}@${HOST}:${REMOTE}/${rel}"
done

echo "→ Running post-deploy commands on VPS"
ssh -i "$SSH_KEY" "${USER}@${HOST}" bash -s <<EOF
set -euo pipefail
cd "${REMOTE}"
php artisan developments:sync-prices
php please stache:clear
php artisan view:clear
php artisan cache:clear
echo "✓ Developments filters deployed"
EOF
