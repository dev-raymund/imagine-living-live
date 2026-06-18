#!/usr/bin/env bash
# Mac/Linux: run from imagineliving.co.uk folder after SSH works:
#   chmod +x scripts/deploy-developments-filters-only-mac.sh
#   ./scripts/deploy-developments-filters-only-mac.sh
set -euo pipefail
export DEPLOY_KEY="${DEPLOY_KEY:-$HOME/.ssh/imagineliving_deploy}"
exec "$(dirname "$0")/deploy-developments-filters-only.sh"
