# Deploy development detail + preview to live

This ships the **preview listing** (`/developments-preview`), **Cityview detail page** (`/developments/a-cityview-point`), and the **Development detail** tab in the CP — without changing the live `/developments` listing (ShareToBuy buttons stay as they are).

---

## Before you deploy

1. **Build assets locally** (required for CSS/JS/map slider):

```powershell
cd C:\projects\imagine-living-live\imagineliving.co.uk
npm run build
```

2. **Smoke-test locally**

| URL | Expected |
|-----|----------|
| `/developments` | Live cards, Cityview → ShareToBuy |
| `/developments-preview` | 10 developments with internal detail links |
| `/developments/a-cityview-point` | Full detail page with map, units, panels |

---

## Option A — Git push (recommended, full deploy)

Use this when GitHub Actions is set up (`DEPLOY.md`).

### Step 1 — Commit from the repo root

```powershell
cd C:\projects\imagine-living-live
git add imagineliving.co.uk/
git status
git commit -m "Add development detail preview pages and CP detail fields"
```

### Step 2 — Push to main

```powershell
git push origin main
```

### Step 3 — Watch GitHub Actions

Repo → **Actions** → **Deploy to VPS** → wait for green check.

The workflow rsyncs the site and runs `scripts/deploy.sh` (composer, `npm run build`, cache clear).

### Step 4 — Verify on live

- https://imagineliving.co.uk/developments
- https://imagineliving.co.uk/developments-preview
- https://imagineliving.co.uk/developments/a-cityview-point

---

## Option B — Upload from your PC (partial, no full git deploy)

Use this when you want only this feature on the VPS without a full site sync.

### Step 1 — Build locally

```powershell
cd C:\projects\imagine-living-live\imagineliving.co.uk
npm run build
```

### Step 2 — Run upload script

```powershell
.\scripts\upload-development-detail.ps1
```

Requires SSH key: `C:\Users\Agility\.ssh\imagineliving_deploy` (see `DEPLOY.md`).

Or with password:

```powershell
.\scripts\upload-development-detail.ps1 -UsePassword
```

### Step 3 — Verify URLs (same as Option A step 4)

---

## Option C — Pull on the VPS from GitHub

Only after **Step 1–2 of Option A** (changes are on `main`).

SSH to the VPS:

```bash
cd /home/ploi/imagineliving.co.uk
curl -fsSL "https://raw.githubusercontent.com/dev-raymund/imagine-living-live/main/scripts/vps-pull-development-detail.sh" -o /tmp/vps-pull-development-detail.sh
bash /tmp/vps-pull-development-detail.sh dev-raymund imagine-living-live
```

---

## What goes live

| Area | Files / behaviour |
|------|-------------------|
| Preview listing page | `developments-preview.md`, `developments-preview.antlers.html`, pages tree |
| Detail page template | `development-detail.antlers.html` + component partials |
| Preview development content | 10 entries with `preview_detail_page: true` (see list below) |
| CP fields | `development.yaml`, `development_detail.yaml`, `property_unit.yaml` |
| Preview filter scope | `DevelopmentsPreviewListingFilters.php` |
| Built CSS/JS | `public/site.generated.css`, `public/site.js` |

**Not changed on live:** `/developments` still uses `_showcase-card.antlers.html` with external ShareToBuy buttons.

### Preview developments (10 examples)

Run locally before deploy (or on server after deploy):

```bash
php artisan developments:seed-preview-examples
```

| Slug | Title |
|------|-------|
| `a-cityview-point` | (A) Cityview Point |
| `a-bow-green` | (A) Bow Green |
| `a-ark-house` | (A) Ark House |
| `a-east-thames-house` | (A) East Thames House |
| `a-portway-house` | (A) Portway House |
| `a-rigel-house` | (A) Rigel House |
| `a-vincent-wharf` | (A) Vincent Wharf |
| `a-ymcc-house` | (A) YMCC House |
| `east-thames-house` | East Thames House |
| `regent-place` | (S) Regent Place |

All other developments keep empty detail fields.

---

## Post-deploy on VPS (if done manually)

```bash
cd /home/ploi/imagineliving.co.uk
composer dump-autoload -o
php artisan developments:clear-detail-fields
php please stache:clear
php artisan view:clear
php artisan cache:clear
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `/developments-preview` 404 | Ensure `content/trees/collections/pages.yaml` includes entry `8f4c2a1b-9d3e-4f5a-b2c1-7e6d5a4b3c2d` |
| Detail page unstyled | Re-run `npm run build` locally, re-upload `site.generated.css` / `site.js` |
| CP missing **Development detail** tab | Upload `development.yaml` + fieldsets, then `php please stache:clear` |
| Wrong devs on preview listing | Run `php artisan developments:clear-detail-fields` (keeps the 10 preview slugs) |
| Map / slider broken | Confirm `site.js` deployed; hard-refresh browser |
