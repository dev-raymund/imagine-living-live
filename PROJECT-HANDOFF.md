# Imagine Living — AI Agent Handoff

Complete context for continuing this project in another AI agent or IDE session.

**Last updated:** June 2026  
**Live site:** [imagineliving.co.uk](https://imagineliving.co.uk)  
**GitHub:** `dev-raymund/imagine-living-live`  
**VPS:** `ploi@77.68.64.22` → `/home/ploi/imagineliving.co.uk`

---

## 1. Workspace — read this first

| Path | What it is |
|------|------------|
| `C:\projects\imagine-living-live\imagineliving.co.uk` | **The live Statamic 3 site** — open this folder in Cursor |
| `C:\projects\imagine-living` | Separate rebuild (Statamic 6) — **not** this project |
| `C:\projects` | Parent folder that is **also** a git repo — do **not** commit deploy work from here unless intentional |

**Correct git repo for deploy:**

```text
C:\projects\imagine-living-live\imagineliving.co.uk
remote: https://github.com/dev-raymund/imagine-living-live.git
branch: main
```

GitHub repo root = site files at repo root (`app/`, `content/`, `scripts/`, etc.).  
VPS pull scripts use: `https://raw.githubusercontent.com/dev-raymund/imagine-living-live/main/...`

---

## 2. Tech stack

- **CMS:** Statamic 3 on Laravel
- **Templates:** Antlers (`.antlers.html`)
- **CSS:** Tailwind + component CSS, built via Parcel → `public/site.generated.css`
- **JS:** Parcel → `public/site.js` (includes per-component JS under `resources/views/`)
- **Map (detail page only):** Leaflet 1.9.4 via CDN in `development-detail.antlers.html`
- **Local dev:** `npm run dev` → Vite-like watch + `php artisan serve` → `http://127.0.0.1:8000`

### Build commands

```powershell
cd C:\projects\imagine-living-live\imagineliving.co.uk
npm run dev          # local development
npm run build        # production CSS + JS (required before deploy)
npm run build:css    # CSS only (if Parcel watch crashes on Windows)
npm run build:js     # JS only
```

**Windows note:** Parcel file watching can crash. Use `npm run build` instead of watch when needed.

### Statamic cache

```bash
php please stache:clear
php artisan view:clear
php artisan cache:clear
```

---

## 3. What we built (conversation goals)

Work spanned multiple sessions. High-level arc:

1. **Property specs on development listing cards** — type, bedrooms, bathrooms, sq ft with icons
2. **Developments search / sort / filter** — `q`, `area`, `max_price`, `sort` on live `/developments`
3. **Internal development detail page** — ShareToBuy-style layout (reference: Cityview Point)
4. **Preview/staging listing** — separate URL so live listing stays unchanged
5. **CMS fields** — Development detail tab in Control Panel for all developments
6. **10 example preview developments** — not just Cityview
7. **Deploy path** — GitHub + VPS pull scripts (same pattern as filters deploy)

### Core product decision (important)

| Page | URL | Behaviour |
|------|-----|-----------|
| **Live listing** | `/developments` | Existing cards, **external ShareToBuy buttons** — unchanged |
| **Preview listing** | `/developments-preview` | Only entries with `preview_detail_page: true`; **internal detail links** |
| **Detail page** | `/developments/{slug}` | ShareToBuy-style page; only enabled for preview entries |

Live and preview share the **same Statamic collection** (`developments`) but different templates and card partials.

---

## 4. URL map

| URL | Template | Card partial |
|-----|----------|--------------|
| `/developments` | `developments.antlers.html` | `_showcase-card.antlers.html` |
| `/developments-preview` | `developments-preview.antlers.html` | `_showcase-card-detail.antlers.html` |
| `/developments/a-cityview-point` | `development-detail.antlers.html` | — |

Preview page entry: `content/collections/pages/developments-preview.md`  
Must be in site tree: `content/trees/collections/pages.yaml` (entry id `8f4c2a1b-9d3e-4f5a-b2c1-7e6d5a4b3c2d`)

Developments collection route: `content/collections/developments.yaml` → `/developments/{slug}`

---

## 5. Architecture

```text
/developments (live)
  └── collection:developments
        query_scope: developments_listing_filters
        partial: showcase-card (external button_url)

/developments-preview (staging)
  └── collection:developments
        query_scope: developments_preview_listing_filters
        partial: showcase-card-detail (links to {{ url }})

/developments/{slug} (detail)
  └── entry template: development-detail
        fields: scheme_type, summary, full_description, map, stations,
                schools, property_units, highlights, eligibility, etc.
```

### Query scopes (auto-registered by class name)

| Scope handle | Class | Effect |
|--------------|-------|--------|
| `developments_listing_filters` | `App\Scopes\DevelopmentsListingFilters` | Search, area, max price, sort |
| `developments_preview_listing_filters` | `App\Scopes\DevelopmentsPreviewListingFilters` | Above + `preview_detail_page: true` |

### Detail page layout

- **70/30** main column + sidebar (ShareToBuy-style)
- **No** mortgage calculator, **no** sign-in
- Image slider, Leaflet map with station/school pins
- Property unit cards: image top, full-width button below
- Breadcrumb + sidebar “View developments” → `/developments-preview`

---

## 6. CMS — where to edit content

**Collections → Developments → [entry]**

| Tab | Fields |
|-----|--------|
| **Main** | Listing card: name, price, specs, images, description, link, buttons |
| **Development detail** | Detail page: address, map, stations, schools, units, scheme type, summary, full description, costs, eligibility, highlights, etc. |
| **Sidebar** | Featured, template (`development-detail`), slug |

**Toggle:** `Preview detail page` — must be ON for entry to appear on `/developments-preview`.

**Field definitions:**

- `resources/blueprints/collections/developments/development.yaml`
- `resources/fieldsets/development_detail.yaml`
- `resources/fieldsets/property_unit.yaml`

**Direct file edit:** `content/collections/developments/{slug}.md`

---

## 7. Preview developments (10)

| Slug | Title | Notes |
|------|-------|-------|
| `a-cityview-point` | (A) Cityview Point | **Full reference content** — real stations, schools, units; protected from seed overwrite |
| `a-bow-green` | (A) Bow Green | Example seed content |
| `a-ark-house` | (A) Ark House | Example seed content |
| `a-east-thames-house` | (A) East Thames House | Example seed content |
| `a-portway-house` | (A) Portway House | Example seed content |
| `a-rigel-house` | (A) Rigel House | Example seed content |
| `a-vincent-wharf` | (A) Vincent Wharf | Example seed content |
| `a-ymcc-house` | (A) YMCC House | Example seed content |
| `east-thames-house` | East Thames House | Example seed content |
| `regent-place` | (S) Regent Place | Example seed content |

Other 24 developments: **no** `preview_detail_page`, **no** detail template, **no** detail field data.

### Cityview live listing (reverted intentionally)

- Button: **Click here to find out more** → `https://www.sharetobuy.com/developments/8034/`
- No internal card link on `/developments`
- Detail page only via preview flow

---

## 8. Artisan commands

| Command | Purpose |
|---------|---------|
| `php artisan developments:sync-prices` | Fill `price_from` from `price_range` |
| `php artisan developments:seed-preview-examples` | Enable + populate 10 preview entries |
| `php artisan developments:seed-preview-examples --force` | Re-seed 9 generic examples (Cityview protected) |
| `php artisan developments:clear-detail-fields` | Strip detail fields from non-preview entries |
| `php artisan developments:enable-detail-pages` | Bulk add `template: development-detail` |
| `php artisan developments:disable-detail-pages` | Remove template except given slug |

Files: `app/Console/Commands/*.php` — auto-loaded via `Kernel::commands()`.

---

## 9. Key files reference

### Templates & partials

```
resources/views/
  developments.antlers.html              # Live listing + filters
  developments-preview.antlers.html        # Preview listing + filters
  development-detail.antlers.html          # Detail page (Leaflet, panels, units)
  layout.antlers.html                      # Loads /site.generated.css + /site.js
  components/showcasecard/
    _showcase-card.antlers.html            # Live card (external buttons)
    _showcase-card-detail.antlers.html     # Preview card (internal link)
    _showcase-card-specs.antlers.html      # Property specs row with icons
    showcaseCard.css
  components/developments/
    developmentDetail.css                  # Detail page styles
    developmentDetail.js                   # Map, slider, panels
    _development-sidebar-cta.antlers.html
    _development-panel-templates.antlers.html
    _development-property-unit-card.antlers.html
    _development-property-card.antlers.html
    _development-unit-specs.antlers.html
    developmentsFilter.css
```

### PHP

```
app/Scopes/DevelopmentsListingFilters.php
app/Scopes/DevelopmentsPreviewListingFilters.php
app/Console/Commands/SyncDevelopmentPrices.php
app/Console/Commands/SeedPreviewDevelopmentExamples.php
app/Console/Commands/ClearDevelopmentDetailFields.php
app/Console/Commands/EnableDevelopmentDetailPages.php
app/Console/Commands/DisableDevelopmentDetailPages.php
```

### Content

```
content/collections/pages/developments-preview.md
content/collections/developments/a-cityview-point.md   # Richest content
content/trees/collections/pages.yaml                   # Includes preview page
```

### Built assets (deploy these)

```
public/site.generated.css
public/site.js
public/css/site.css   # synced copy
```

---

## 10. Deploy — three options

### Option A — Git push + GitHub Actions

```powershell
cd C:\projects\imagine-living-live\imagineliving.co.uk
npm run build
git add .
git commit -m "Your message"
git push origin main
```

Watch **GitHub → Actions → Deploy to VPS**.  
Workflow: `.github/workflows/deploy.yml` → rsync to VPS → `scripts/deploy.sh`.

### Option B — VPS pull from GitHub (preferred by user)

**Step 1:** Push to `main` (as above).

**Step 2:** On VPS as user `ploi`:

```bash
cd /home/ploi/imagineliving.co.uk
curl -fsSL "https://raw.githubusercontent.com/dev-raymund/imagine-living-live/main/scripts/vps-pull-development-detail.sh" -o /tmp/vps-pull-development-detail.sh
bash /tmp/vps-pull-development-detail.sh dev-raymund imagine-living-live
```

Older filters-only script (still valid for filter changes):

```bash
curl -fsSL "https://raw.githubusercontent.com/dev-raymund/imagine-living-live/main/scripts/vps-pull-filters.sh" -o /tmp/vps-pull-filters.sh
bash /tmp/vps-pull-filters.sh dev-raymund imagine-living-live
```

### Option C — Upload from PC (no git)

```powershell
cd C:\projects\imagine-living-live\imagineliving.co.uk
npm run build
.\scripts\upload-development-detail.ps1
```

SSH key: `C:\Users\Agility\.ssh\imagineliving_deploy`

### Post-deploy on VPS

```bash
composer dump-autoload -o
php artisan developments:clear-detail-fields
php please stache:clear
php artisan view:clear
php artisan cache:clear
```

### Deploy docs

- `DEPLOY.md` — GitHub Actions setup
- `DEPLOY-DEVELOPMENTS-FILTERS.md` — filters-only deploy
- `DEPLOY-DEVELOPMENT-DETAIL-PREVIEW.md` — preview/detail feature deploy

---

## 11. Current state (not yet on live)

As of handoff, **preview/detail work is local only** — not fully pushed to GitHub.

**Modified (tracked):** development entries, blueprint, built CSS/JS, pages tree, etc.

**Untracked (new feature — must be `git add` before push):**

```
app/Console/Commands/ClearDevelopmentDetailFields.php
app/Console/Commands/DisableDevelopmentDetailPages.php
app/Console/Commands/EnableDevelopmentDetailPages.php
app/Console/Commands/SeedPreviewDevelopmentExamples.php
app/Scopes/DevelopmentsPreviewListingFilters.php
content/collections/pages/developments-preview.md
resources/fieldsets/development_detail.yaml
resources/fieldsets/property_unit.yaml
resources/views/development-detail.antlers.html
resources/views/developments-preview.antlers.html
resources/views/components/developments/*  (detail partials, css, js)
resources/views/components/showcasecard/_showcase-card-detail.antlers.html
scripts/vps-pull-development-detail.sh
scripts/upload-development-detail.ps1
DEPLOY-DEVELOPMENT-DETAIL-PREVIEW.md
```

**Latest commit on `main`:** `5540ffc Populate property specs on all development listings.`

**To go live:** commit all above → `git push origin main` → run VPS pull script.

---

## 12. Known issues & gotchas

1. **Two git roots** — `C:\projects` vs `imagineliving.co.uk`. Always deploy from `imagineliving.co.uk` repo.
2. **`git add .` from wrong folder** — staging `public/assets` is huge and slow; prefer targeted adds or ensure `.gitignore` covers heavy folders.
3. **Local dev timeouts** — PHP 60s max execution time on slow Statamic requests; restart dev server / clear stache if pages hang.
4. **VPS pull requires GitHub** — files must exist on `main` before `curl` pull works (404 until pushed).
5. **`rsync` excludes `public/assets/`** — images stay on server; don't expect asset sync via deploy.
6. **Seed command pricing** — `price_from` = full market value; share price = 25% of that. Cityview slug is **protected** from `--force` reseed.
7. **Parcel on Windows** — watch mode unstable; use `npm run build` for production assets.

---

## 13. Conversation timeline (user prompts → outcomes)

| User ask | What we did |
|----------|-------------|
| Property specs on listing cards | Added fields to blueprint + `_showcase-card-specs.antlers.html` |
| ShareToBuy-style detail page | `development-detail.antlers.html` + fieldsets + Cityview content |
| Map with station/school pins | Leaflet + `stations`/`schools` replicators + `developmentDetail.js` |
| Image slider on detail page | Swiper in detail template + JS |
| 70/30 layout, sidebar, no calculator | CSS + `_development-sidebar-cta.antlers.html` |
| Property cards layout | `_development-property-unit-card.antlers.html` |
| Preview listing separate from live | `/developments-preview` + `DevelopmentsPreviewListingFilters` |
| Revert Cityview live card to ShareToBuy | External `button_url`; detail only on preview |
| Where to edit CP fields | Explained tabs; split blueprint into Main + Development detail |
| Empty detail fields on other devs | `developments:clear-detail-fields` command |
| 10 preview examples | `developments:seed-preview-examples` + 9 seeded entries |
| Deploy to live | Deploy docs + upload script + `vps-pull-development-detail.sh` |
| VPS command deploy | Same pattern as `vps-pull-filters.sh` |
| Git push | Attempted; blocked by repo confusion + large staging — **still pending** |

---

## 14. Suggested first prompt for new AI agent

Copy-paste to continue:

```text
I'm working on the Imagine Living Statamic 3 site at
C:\projects\imagine-living-live\imagineliving.co.uk

Read PROJECT-HANDOFF.md first.

Current task: deploy preview/detail feature to live.
- Push uncommitted + untracked files to dev-raymund/imagine-living-live main
- Then VPS: bash vps-pull-development-detail.sh

Live /developments must stay unchanged (ShareToBuy buttons).
Preview /developments-preview should show 10 developments with internal detail pages.
Cityview (a-cityview-point) has full reference content; others have example seed content.
```

---

## 15. Related projects

| Repo / folder | Status |
|---------------|--------|
| `imagineliving.co.uk` (this) | Live site, Statamic 3, active work |
| `imagine-living` | Future rebuild, Statamic 6, separate |
| `alex-rose`, `alexander-rose.net` | Unrelated folders under `C:\projects` |

---

## 16. SSH & server

| Setting | Value |
|---------|--------|
| Host | `77.68.64.22` |
| User | `ploi` |
| App path | `/home/ploi/imagineliving.co.uk` |
| Deploy key (PC) | `C:\Users\Agility\.ssh\imagineliving_deploy` |
| GitHub secrets | `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` |

---

*End of handoff document.*
