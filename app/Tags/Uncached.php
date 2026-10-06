<?php

namespace App\Tags;

use Statamic\StaticCaching\NoCache\Session;
use Statamic\Tags\Tags;

/**
 * Like {{ nocache }}: the contents are rendered afresh on every request, even
 * when the page itself is served from the static cache. Use it for markup that
 * depends on the visitor's cookie consent.
 *
 * Unlike {{ nocache }}, it doesn't store the surrounding page's variables with
 * the region, so the contents only see the global cascade (globals, site,
 * csrf_token, ...). Statamic 3.4's nocache compares every variable it captures
 * against the cascade with `!=`, and some live page data makes that throw
 * ("Object of class Statamic\Fields\Value could not be converted to int").
 * Wrapping oreos:popup in nocache in the layout took every page down that way.
 *
 * Usage: {{ uncached }} ... {{ /uncached }}
 */
class Uncached extends Tags
{
    public function index()
    {
        return app(Session::class)
            ->pushRegion($this->content, [], 'antlers.html')
            ->placeholder();
    }
}
