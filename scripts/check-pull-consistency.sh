#!/usr/bin/env bash
# Consistency check for the VPS pull script.
# Run locally BEFORE pushing/deploying:
#   bash scripts/check-pull-consistency.sh
#
# For every file the pull script fetches it verifies the file:
#   1. exists on disk in this repo (else the VPS curl would 404),
#   2. is tracked by git (else it won't be on GitHub for the VPS to pull),
#   3. has no uncommitted changes (else live gets a stale version).
# Exits non-zero if any problem is found.

set -uo pipefail

cd "$(dirname "$0")/.."

PULL_SCRIPT="scripts/vps-pull-development-detail.sh"
problems=0

# Collect every concrete path referenced by the pull script:
#   - lines of the form:  pull <path>
#   - entries inside the PREVIEW_DEVELOPMENTS=( ... ) array
# Strip CR (Windows line endings), trailing comments, and surrounding
# whitespace; drop any token that contains a shell variable ($).
paths="$(
  {
    grep -E '^[[:space:]]*pull[[:space:]]+' "$PULL_SCRIPT" \
      | sed -E 's/^[[:space:]]*pull[[:space:]]+//'
    awk '/PREVIEW_DEVELOPMENTS=\(/{f=1;next} f&&/^[[:space:]]*\)/{f=0} f' "$PULL_SCRIPT"
  } \
    | tr -d '\r' \
    | sed -E 's/#.*$//; s/^[[:space:]]+//; s/[[:space:]]+$//' \
    | grep -E '\S' \
    | grep -vE '\$'
)"

echo "Checking files referenced by $PULL_SCRIPT ..."
echo

while IFS= read -r rel; do
  [ -z "$rel" ] && continue

  if [ ! -f "$rel" ]; then
    echo "  MISSING ON DISK : $rel"
    problems=$((problems + 1))
    continue
  fi

  if ! git ls-files --error-unmatch "$rel" >/dev/null 2>&1; then
    echo "  NOT GIT-TRACKED : $rel  (won't exist on GitHub for the VPS to pull)"
    problems=$((problems + 1))
    continue
  fi

  if ! git diff --quiet -- "$rel" || ! git diff --cached --quiet -- "$rel"; then
    echo "  UNCOMMITTED     : $rel  (commit + push before deploying)"
    problems=$((problems + 1))
    continue
  fi

  echo "  ok              : $rel"
done <<< "$paths"

echo
if [ "$problems" -eq 0 ]; then
  echo "PASS: every pulled file exists, is tracked, and is committed."
  exit 0
else
  echo "FAIL: $problems issue(s) above must be fixed before the VPS pull will deploy correctly."
  exit 1
fi
