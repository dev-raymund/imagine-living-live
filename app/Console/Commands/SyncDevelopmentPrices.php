<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Statamic\Facades\Entry;

class SyncDevelopmentPrices extends Command
{
    protected $signature = 'developments:sync-prices {--force : Overwrite existing price_from values}';

    protected $description = 'Set price_from from the cheapest property unit, or from price_range when a development has none';

    public function handle(): int
    {
        $force = $this->option('force');
        $updated = 0;
        $skipped = 0;

        foreach (Entry::query()->where('collection', 'developments')->get() as $entry) {
            if (! $force && $entry->get('price_from')) {
                $skipped++;

                continue;
            }

            // Property units are the source of truth for what a development costs
            // where they exist, matching what {{ unit_price_range }} displays. The
            // Price Range field is only consulted for developments without units.
            $parsed = $this->lowestUnitPricePounds($entry)
                ?? $this->parseFirstPricePounds((string) $entry->get('price_range', ''));
            if ($parsed === null) {
                if ($force && $entry->get('price_from') !== null) {
                    $entry->set('price_from', null)->save();
                    $updated++;
                    $this->line($entry->slug().': cleared price_from (not a purchase range)');
                } else {
                    $skipped++;
                }

                continue;
            }

            if ((int) $entry->get('price_from') === $parsed) {
                continue;
            }

            $entry->set('price_from', $parsed)->save();
            $updated++;
            $this->line($entry->slug().': price_from = '.$parsed);
        }

        $this->info("Updated {$updated} entries, skipped {$skipped}.");

        return self::SUCCESS;
    }

    /**
     * The cheapest property unit price, in whole pounds. Null when the
     * development has no units, or none of them carry a usable price.
     */
    private function lowestUnitPricePounds($entry): ?int
    {
        $lowest = null;

        foreach ($entry->get('property_units') ?? [] as $unit) {
            $price = (string) ($unit['unit_price'] ?? '');
            $lower = strtolower($price);

            // price_from drives the purchase-price sort and the max-price
            // filter, so rents must not land in it - the same guard
            // parseFirstPricePounds applies to the Price Range field.
            if (str_contains($lower, 'pcm') || str_contains($lower, 'per month') || str_contains($lower, 'p.c.m') || str_contains($lower, 'pw')) {
                continue;
            }

            $numeric = preg_replace('/[^0-9.]/', '', str_replace(',', '', $price));

            if ($numeric === '' || ! is_numeric($numeric)) {
                continue;
            }

            $pounds = (int) round((float) $numeric);

            if ($pounds > 0 && ($lowest === null || $pounds < $lowest)) {
                $lowest = $pounds;
            }
        }

        return $lowest;
    }

    private function parseFirstPricePounds(string $text): ?int
    {
        if ($text === '') {
            return null;
        }

        $lower = strtolower($text);
        if (str_contains($lower, 'pcm') || str_contains($lower, 'per month') || str_contains($lower, 'p.c.m')) {
            return null;
        }

        if (! preg_match_all('/£\s*([\d,]+)/u', $text, $matches)) {
            return null;
        }

        $amounts = array_map(fn ($s) => (int) str_replace(',', '', $s), $matches[1]);
        $maxAmt = max($amounts);
        if ($maxAmt < 20_000 && ! str_contains($text, ',')) {
            return null;
        }

        $first = $matches[1][0] ?? null;
        if ($first === null) {
            return null;
        }

        $digits = (int) str_replace(',', '', $first);

        return $digits > 0 ? $digits : null;
    }
}
