#!/usr/bin/env bash
# Run on the VPS as user ploi (pull the cookie consent update from GitHub main).
#   cd /home/ploi/imagineliving.co.uk
#   curl -fsSL "https://raw.githubusercontent.com/dev-raymund/imagine-living-live/main/scripts/vps-pull-cookie-consent.sh" -o /tmp/vps-pull-cookie-consent.sh
#   bash /tmp/vps-pull-cookie-consent.sh dev-raymund imagine-living-live
# Never run as root. See DEPLOY-COOKIE-CONSENT.md.
#
# Everything it replaces is backed up first to ~/backups/cookie-consent-<time>/,
# together with a restore.sh that puts it all back. Afterwards it loads the main
# pages; if any of them fails it prints the error and runs restore.sh itself.

set -euo pipefail

GITHUB_USER="${1:-dev-raymund}"
GITHUB_REPO="${2:-imagine-living-live}"
BRANCH="${3:-main}"
BASE="${BASE:-https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${BRANCH}}"

APP_DIR="${APP_DIR:-/home/ploi/imagineliving.co.uk}"
SITE_URL="${SITE_URL:-https://imagineliving.co.uk}"
cd "$APP_DIR"

if [ "$(id -u)" -eq 0 ]; then
    echo "Run this as ploi, not root." >&2
    exit 1
fi

CODE_FILES=(
    app/Tags/Uncached.php
    config/oreos.php
    resources/lang/vendor/statamic-oreos/en/messages.php
    resources/views/layout.antlers.html
    resources/views/contact.antlers.html
    resources/views/components/footer/_footer.antlers.html
    resources/views/vendor/statamic-oreos/popup.antlers.html
    resources/views/vendor/statamic-oreos/form.antlers.html
    resources/views/vendor/statamic-oreos/oreos.css
    resources/css/views/contact.css
    resources/views/components/texteditor/textEditor.css
    resources/css/site.generated.css
    # Built CSS, since this script doesn't run npm. The live layout loads
    # /site.generated.css; nothing loads the public/css copies any more.
    public/site.generated.css
    scripts/apply-cookie-policy.php
)
POLICY=content/collections/pages/privacy-policy.md
BANNER_TEXT=content/oreos.yaml
# content/ is edited in the live control panel, so these are only replaced if
# they still match what was committed before this change (sha256). Anything an
# editor has changed since is left alone and reported.
BANNER_TEXT_BEFORE=a3517ef29357617baa4ea983a291b6d31902c953332377139b8a621a768e7b77

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

# Download everything before touching the site, so a failed download (raw
# GitHub returns the odd transient 502) can't leave it half-updated.
pull() {
    local rel="$1"
    local attempt
    echo "→ $rel"
    mkdir -p "$STAGE/$(dirname "$rel")"
    for attempt in 1 2 3; do
        if curl -fsSL --retry 2 --retry-delay 2 "${BASE}/${rel}" -o "$STAGE/$rel"; then
            return 0
        fi
        echo "   retry ${attempt}/3 after transient failure"
        sleep 3
    done
    echo "   FAILED: ${rel} - nothing on the site has been changed" >&2
    return 1
}

echo "Downloading from ${BASE}"
for f in "${CODE_FILES[@]}" "$BANNER_TEXT"; do
    pull "$f"
done

BACKUP="${BACKUP_ROOT:-$HOME/backups}/cookie-consent-$(date +%Y%m%d-%H%M%S)"
echo "→ Backing up current files to $BACKUP"
mkdir -p "$BACKUP/files"
NEW_FILES=()
for f in "${CODE_FILES[@]}" "$BANNER_TEXT" "$POLICY"; do
    if [ -f "$f" ]; then
        mkdir -p "$BACKUP/files/$(dirname "$f")"
        cp -p "$f" "$BACKUP/files/$f"
    else
        NEW_FILES+=("$f")
    fi
done
{
    echo "#!/usr/bin/env bash"
    echo "# Puts back everything vps-pull-cookie-consent.sh replaced on $(date '+%Y-%m-%d %H:%M')."
    echo "set -euo pipefail"
    echo "cd \"$APP_DIR\""
    echo "cp -a \"$BACKUP/files/.\" ."
    for f in "${NEW_FILES[@]}"; do
        echo "rm -f \"$f\""
    done
    echo "composer dump-autoload -o --no-interaction"
    echo "php please stache:clear"
    echo "php artisan view:clear"
    echo "php artisan cache:clear"
    echo "php please static:clear"
    echo "echo \"✓ Restored the files from $BACKUP\""
} > "$BACKUP/restore.sh"

status() {
    curl -s -o /dev/null -w '%{http_code}' --max-time 60 "${SITE_URL}$1" || true
}

# From here on, anything that goes wrong puts the previous version back.
roll_back() {
    echo "   ✗ $1"
    local log
    log="$(ls -t storage/logs/laravel*.log 2>/dev/null | head -n 1 || true)"
    if [ -n "$log" ]; then
        echo "   Last error logged:"
        grep -h -E '^\[[^]]+\] [a-z]+\.ERROR' "$log" | tail -n 1 | cut -c1-900 || true
    fi
    echo "→ Putting the previous version back"
    bash "$BACKUP/restore.sh"
    echo "   / now returns $(status /)"
    echo
    echo "✗ Deploy rolled back. Nothing from this update is live. Send the error line above."
    exit 1
}

echo "→ Installing code"
for f in "${CODE_FILES[@]}"; do
    mkdir -p "$(dirname "$f")"
    cp "$STAGE/$f" "$f"
done

echo "→ Banner text ($BANNER_TEXT)"
current="$(sha256sum "$BANNER_TEXT" | cut -d' ' -f1)"
if [ "$current" = "$BANNER_TEXT_BEFORE" ]; then
    cp "$STAGE/$BANNER_TEXT" "$BANNER_TEXT"
    echo "   updated"
elif [ "$current" = "$(sha256sum "$STAGE/$BANNER_TEXT" | cut -d' ' -f1)" ]; then
    echo "   already up to date"
else
    BANNER_SKIPPED=1
    echo "   SKIPPED: edited in the control panel since; enter the new texts in"
    echo "   Tools → Oreos instead (DEPLOY-COOKIE-CONSENT.md lists them)"
fi

echo "→ Privacy policy cookie section ($POLICY)"
if php scripts/apply-cookie-policy.php "$POLICY" "$(date +%d.%m.%Y)"; then
    echo "   updated (Last updated: $(date +%d.%m.%Y))"
else
    POLICY_SKIPPED=1
    echo "   SKIPPED (reason above); the rest of the deploy carried on"
fi

echo "→ Autoloader (new tag class) and caches (cache:clear also empties the static page cache)"
{
    composer dump-autoload -o --no-interaction &&
    php please stache:clear &&
    php artisan view:clear &&
    php artisan cache:clear &&
    php please static:clear
} || roll_back "clearing caches failed"

# Each page twice: the first request renders and caches it, the second is
# served from the static cache. Either can fail on its own.
echo "→ Checking the site"
for p in / /about-us /contact-us /privacy-policy /developments /faq; do
    for pass in render cached; do
        code="$(status "$p")"
        if [ "$code" = "000" ]; then
            UNCHECKED=1
            echo "   ? $p could not be reached from the server; check it in a browser"
            break 2
        fi
        if [ "$code" != "200" ]; then
            roll_back "$p returned $code ($pass)"
        fi
    done
    echo "   ✓ $p"
done

echo
echo "✓ Done."
if [ -n "${UNCHECKED:-}" ]; then
    echo "  ! The site couldn't be checked from the server - open it in a browser now."
fi
if [ -n "${BANNER_SKIPPED:-}" ]; then
    echo "  ! Banner text was not replaced - see above."
fi
if [ -n "${POLICY_SKIPPED:-}" ]; then
    echo "  ! Privacy policy was not changed - see above."
fi
echo "  Check: / (banner), /contact-us (map placeholder), /privacy-policy (cookie section)"
echo "  Undo everything: bash $BACKUP/restore.sh"
