<?php

namespace App\Http\Controllers;

use Statamic\Facades\Entry;
use Statamic\View\View;

/**
 * A development's homes are described by bedroom configuration rather than by
 * individual address, so each entry in the development's `property_units` field
 * gets its own page at /developments/{development}/properties/{n}-bedroom.
 *
 * The variants stay nested in the development entry - there are only two or
 * three per development and editors manage them alongside everything else - so
 * this resolves them by hand rather than through a collection route.
 */
class DevelopmentPropertyController extends Controller
{
    public function show(string $development, string $variant)
    {
        $entry = Entry::query()
            ->where('collection', 'developments')
            ->where('slug', $development)
            ->where('status', 'published')
            ->first();

        abort_unless($entry, 404);

        $bedrooms = $this->bedroomsFromSlug($variant);

        abort_if($bedrooms === null, 404);

        // Only 404 on a missing variant, so an unpublished or unpopulated
        // development never advertises a page it cannot render.
        abort_unless($this->hasVariant($entry, $bedrooms), 404);

        return (new View)
            ->template('property-variant')
            ->layout('layout')
            ->cascadeContent($entry)
            ->with([
                'variant_bedrooms' => $bedrooms,
                'variant_slug' => $variant,
            ])
            ->render();
    }

    /**
     * "2-bedroom" => 2. Anything else is not a variant URL we serve.
     */
    private function bedroomsFromSlug(string $variant): ?int
    {
        if (! preg_match('/^(\d+)-bedroom$/', $variant, $matches)) {
            return null;
        }

        $bedrooms = (int) $matches[1];

        return $bedrooms > 0 ? $bedrooms : null;
    }

    private function hasVariant($entry, int $bedrooms): bool
    {
        foreach ($entry->value('property_units') ?? [] as $unit) {
            if ((int) ($unit['bedrooms'] ?? 0) === $bedrooms) {
                return true;
            }
        }

        return false;
    }
}
