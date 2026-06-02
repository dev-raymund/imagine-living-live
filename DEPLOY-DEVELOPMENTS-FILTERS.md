# Deploy developments search & sort only

Use this when you want **only** the developments listing filters on the live VPS, without a full site deploy.

**If you do not control the old developer’s GitHub:** use **Option A** (upload from your PC). Do not use Git on the VPS unless `git remote -v` shows a repo you own and can access.

## What gets deployed

| File | Purpose |
|------|---------|
| `app/Scopes/DevelopmentsListingFilters.php` | Search (`q`) and max price filter |
| `app/Console/Commands/SyncDevelopmentPrices.php` | Fills `price_from` from `price_range` |
| `app/Console/Kernel.php` | Registers the sync command |
| `app/Providers/AppServiceProvider.php` | Registers the sync command |
| `resources/views/developments.antlers.html` | Filter form + sort |
| `resources/views/partials/_developments-results.antlers.html` | Results + empty state |
| `resources/blueprints/collections/developments/development.yaml` | `price_from` field in CP |

No `npm run build` is required for this feature (existing CSS utilities are enough).

---

## Option A — Upload from your PC (use this)

You already have these files locally. The VPS does not need access to any GitHub repo.

### A1 — PowerShell script

```powershell
cd C:\projects\imagine-living-live\imagineliving.co.uk
.\scripts\upload-developments-filters.ps1
```

Requires SSH key: `C:\Users\Agility\.ssh\imagineliving_deploy` (see `DEPLOY.md`).

### A2 — WinSCP / FileZilla (no Git, no CLI)

| Setting | Value |
|--------|--------|
| Protocol | SFTP |
| Host | `77.68.64.22` |
| User | `ploi` |
| Remote folder | `/home/ploi/imagineliving.co.uk` |

Upload the 7 files above into the same paths on the server.

### A3 — After upload, run on the VPS (SSH or Fasthosts console)

```bash
cd /home/ploi/imagineliving.co.uk
ls -la app/Console/Commands/SyncDevelopmentPrices.php
composer dump-autoload -o
php artisan developments:sync-prices
php please stache:clear
php artisan view:clear
php artisan cache:clear
```

---

## Option B — Git on the VPS (rarely applies)

**Skip this** unless you have already checked on the server:

```bash
cd /home/ploi/imagineliving.co.uk
git status
git remote -v
```

All of the following must be true:

- It is a git repository (not “not a git repository”).
- `origin` points to **your** GitHub (e.g. `dev-raymund/imagine-living-live`), not the old developer’s repo.
- You can `git fetch origin` without authentication errors.

Then:

```bash
git fetch origin
git checkout origin/main -- \
  app/Scopes/DevelopmentsListingFilters.php \
  app/Console/Commands/SyncDevelopmentPrices.php \
  app/Console/Kernel.php \
  app/Providers/AppServiceProvider.php \
  resources/views/developments.antlers.html \
  resources/views/partials/_developments-results.antlers.html \
  resources/blueprints/collections/developments/development.yaml
```

Then run the **Option A3** commands.

If any check fails, use **Option A** only.

---

## Option C — GitHub Actions (full deploy)

Only if you have set up `DEPLOY.md` (your repo + SSH secrets on GitHub). Pushes to `main` deploy the whole site, not just these files.

```powershell
cd C:\projects\imagine-living-live\imagineliving.co.uk
git push origin main
```

---

## Verify on live

1. Open the developments page.
2. You should see **Search by name**, **Max price**, and **Sort**.
3. Submit a filter — URL should include `?q=...`, `?max_price=...`, or `?sort=name`.

If sort by price does nothing, run `php artisan developments:sync-prices` again.

---

## Optional: sync prices only (code already on server)

```bash
cd /home/ploi/imagineliving.co.uk
composer dump-autoload -o
php artisan developments:sync-prices
php please stache:clear
```

Use `--force` to rebuild every entry from `price_range`:

```bash
php artisan developments:sync-prices --force
```
