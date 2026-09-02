<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Statamic\Facades\Entry;

class SyncDevelopmentPrices extends Command
{
    protected $signature = 'developments:sync-prices {--force : Overwrite existing price_from values}';

    protected $description = 'Set price_from from price_range; developments with property units are skipped';

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

            // Developments with property units are left alone. Their displayed
            // price comes from the units via {{ unit_price_range }}, and price_from
            // is not maintained for them.
            if ($this->hasUnitPrices($entry)) {
                $skipped++;

                continue;
            }

            $parsed = $this->parseFirstPricePounds((string) $entry->get('price_range', ''));
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
     * Whether a development carries any property unit with a usable price.
     */
    private function hasUnitPrices($entry): bool
    {
        foreach ($entry->get('property_units') ?? [] as $unit) {
            $numeric = preg_replace('/[^0-9.]/', '', str_replace(',', '', (string) ($unit['unit_price'] ?? '')));

            if ($numeric !== '' && is_numeric($numeric)) {
                return true;
            }
        }

        return false;
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
