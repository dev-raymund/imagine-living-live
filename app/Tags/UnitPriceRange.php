<?php

namespace App\Tags;

use Statamic\Tags\Tags;

/**
 * The price range shown for a development, derived from its property units.
 *
 * Editors were typing the range into Price Range by hand while also entering a
 * price on every unit, so the two drifted apart the moment a unit was added,
 * removed or repriced. This reads the units instead and falls back to the
 * manually entered Price Range when a development has none.
 *
 * Usage: {{ unit_price_range }}
 */
class UnitPriceRange extends Tags
{
    public function index()
    {
        $prices = $this->unitPrices();

        if (empty($prices)) {
            return (string) ($this->context->value('price_range') ?? '');
        }

        $lowest = reset($prices);
        $highest = end($prices);

        // Output the editor's own strings rather than reformatting, so "pcm",
        // decimals and any other wording survive exactly as entered.
        return $lowest === $highest ? $lowest : $lowest.' - '.$highest;
    }

    /**
     * Unit price strings keyed and sorted by their numeric value. Units with no
     * price, or a price with no digits in it, are ignored.
     *
     * @return array<int, string>
     */
    private function unitPrices(): array
    {
        $units = $this->context->value('property_units');

        if ($units instanceof \Statamic\Fields\Value) {
            $units = $units->value();
        }

        $prices = [];

        foreach ($units ?? [] as $unit) {
            $price = trim((string) ($unit['unit_price'] ?? ''));

            if ($price === '') {
                continue;
            }

            $numeric = preg_replace('/[^0-9.]/', '', str_replace(',', '', $price));

            if ($numeric === '' || ! is_numeric($numeric)) {
                continue;
            }

            $prices[] = ['value' => (float) $numeric, 'label' => $price];
        }

        usort($prices, fn ($a, $b) => $a['value'] <=> $b['value']);

        return array_column($prices, 'label');
    }
}
