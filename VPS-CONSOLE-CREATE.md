# Create filter files on the VPS console

Use this when you upload files manually is awkward but you can **copy from this file on your PC** into the **black terminal** (not inside nano).

## Before you start

```bash
su - ploi
cd /home/ploi/imagineliving.co.uk
mkdir -p app/Scopes app/Console/Commands app/Providers
mkdir -p resources/views/partials
mkdir -p resources/blueprints/collections/developments
```

## How each file is created

For each file below:

1. Run the `cat > ... << 'EOF'` line shown.
2. On your **PC**, open the matching section in this file (or the real file in the project), **Select all** for that file’s content, **Copy**.
3. In the **VPS console**, **paste** (try **Ctrl+Shift+V** or the panel **Paste** button).
4. Press **Enter**, then type **`EOF`** on a new line and **Enter** again.

If paste still fails, use WinSCP/Cyberduck instead.

---

## File 1: `app/Scopes/DevelopmentsListingFilters.php`

```bash
cat > app/Scopes/DevelopmentsListingFilters.php << 'EOF'
```

Paste:

```php
<?php

namespace App\Scopes;

use Statamic\Query\Scopes\Scope;

class DevelopmentsListingFilters extends Scope
{
    public function apply($query, $values): void
    {
        $q = trim((string) request('q', ''));
        if ($q !== '') {
            $like = '%'.addcslashes($q, '%_\\').'%';
            $query->where('title', 'like', $like);
        }

        $max = filter_var(request('max_price'), FILTER_VALIDATE_INT);
        if ($max !== false && $max > 0) {
            $query->whereNotNull('price_from')
                ->where('price_from', '<=', $max);
        }
    }
}
```

Then type: `EOF`

---

## File 2: `app/Console/Commands/SyncDevelopmentPrices.php`

```bash
cat > app/Console/Commands/SyncDevelopmentPrices.php << 'EOF'
```

Paste the full contents of `app/Console/Commands/SyncDevelopmentPrices.php` from your PC project (85 lines).

Then: `EOF`

---

## File 3: `app/Console/Kernel.php`

Only replace if yours does not register the command. Check first:

```bash
grep SyncDevelopmentPrices app/Console/Kernel.php
```

If missing:

```bash
cat > app/Console/Kernel.php << 'EOF'
```

Paste from `app/Console/Kernel.php` on your PC.

Then: `EOF`

---

## File 4: `app/Providers/AppServiceProvider.php`

```bash
cat > app/Providers/AppServiceProvider.php << 'EOF'
```

Paste:

```php
<?php

namespace App\Providers;

use App\Console\Commands\SyncDevelopmentPrices;
use Illuminate\Support\ServiceProvider;
use Statamic\Statamic;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public function boot()
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                SyncDevelopmentPrices::class,
            ]);
        }
    }
}
```

Then: `EOF`

---

## File 5: `resources/views/partials/_developments-results.antlers.html`

```bash
cat > resources/views/partials/_developments-results.antlers.html << 'EOF'
```

Paste:

```html
{{ if no_results }}
    <p class="p w-full text-center md:text-left lg:px-6 xl:px-14">No developments match your filters.</p>
{{ /if }}
<div class="testimonials__content flex flex-col justify-center md:flex-row md:flex-wrap">
    {{ developments }}
        {{ partial:components/showcasecard/showcase-card }}
    {{ /developments }}
</div>
<div class="mt-6 md:mt-12">
    {{ partial:components/pagination/pagination }}
</div>
```

Then: `EOF`

---

## File 6: `resources/views/developments.antlers.html`

```bash
cat > resources/views/developments.antlers.html << 'EOF'
```

Paste the full `resources/views/developments.antlers.html` from your PC (57 lines).

Then: `EOF`

---

## File 7: `resources/blueprints/collections/developments/development.yaml`

If the live blueprint already exists, you can **edit** instead of replacing everything:

```bash
nano resources/blueprints/collections/developments/development.yaml
```

Add the `price_from` block after `price_range` (copy from your PC file lines 37–45).

Or replace the whole file:

```bash
cat > resources/blueprints/collections/developments/development.yaml << 'EOF'
```

Paste full `development.yaml` from your PC (133 lines).

Then: `EOF`

---

## Finish on the server

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

## Easier than console paste

- **Ploi** → File Manager → edit/upload files in the browser.
- Copy file contents from Cursor on your PC, paste into Ploi’s **file editor** (usually works better than the SSH console).
