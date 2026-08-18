<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Statamic\Facades\Entry;

class ClearDevelopmentDetailFields extends Command
{
    protected $signature = 'developments:clear-detail-fields {--except=a-cityview-point} {--keep=* : Additional slugs to keep detail fields on}';

    protected $description = 'Remove preview/detail page fields from development entries except the given slug';

    private const DETAIL_FIELDS = [
        'template',
        'address',
        'map_latitude',
        'map_longitude',
        'stations',
        'schools',
        'property_units',
        'scheme_type',
        'price_display',
        'share_pricing_note',
        'summary',
        'full_description',
        'monthly_cost_total',
        'monthly_rent',
        'monthly_service_charge',
        'monthly_mortgage',
        'mortgage_rate_note',
        'eligibility_items',
        'highlights',
        'key_features',
        'material_information',
        'estimated_costs',
        'floor_plan',
    ];

    public function handle(): int
    {
        // --except and --keep are the whole keep list. There used to be a
        // hardcoded roster of preview slugs merged in here, which meant the
        // command could never clear those entries no matter what you passed -
        // including two that reached production carrying seeded example data.
        $keep = array_unique(array_merge(
            [$this->option('except')],
            $this->option('keep') ?: []
        ));
        $cleared = 0;

        foreach (Entry::query()->where('collection', 'developments')->get() as $entry) {
            if (in_array($entry->slug(), $keep, true)) {
                continue;
            }

            $changed = false;

            foreach (self::DETAIL_FIELDS as $field) {
                if ($entry->has($field)) {
                    $entry->remove($field);
                    $changed = true;
                }
            }

            if (! $changed) {
                continue;
            }

            $entry->save();
            $cleared++;
            $this->line('Cleared detail fields: '.$entry->slug());
        }

        $this->info('Cleared detail fields on '.$cleared.' entries. Kept: '.implode(', ', $keep).'.');

        return self::SUCCESS;
    }
}
