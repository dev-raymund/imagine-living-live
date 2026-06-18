<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Statamic\Facades\Entry;

class SeedPreviewDevelopmentExamples extends Command
{
    protected $signature = 'developments:seed-preview-examples {--force : Overwrite existing detail content}';

    protected $description = 'Enable preview detail pages with example content for 10 developments';

    private const PREVIEW_SLUGS = [
        'a-cityview-point',
        'a-bow-green',
        'a-ark-house',
        'a-east-thames-house',
        'a-portway-house',
        'a-rigel-house',
        'a-vincent-wharf',
        'a-ymcc-house',
        'east-thames-house',
        'regent-place',
    ];

    private const AREA_COORDS = [
        'Tower Hamlets' => ['51.5155', '-0.0320'],
        'Southwark' => ['51.5030', '-0.0780'],
        'Poplar' => ['51.5158', '-0.0082'],
        'Brent' => ['51.5580', '-0.2800'],
        'Bournemouth' => ['50.7192', '-1.8808'],
        'Newham' => ['51.5308', '0.0060'],
        'Hackney' => ['51.5450', '-0.0550'],
        'Waltham Forest' => ['51.5886', '-0.0118'],
    ];

    private const PROTECTED_SLUGS = [
        'a-cityview-point',
    ];

    public function handle(): int
    {
        $force = $this->option('force');
        $updated = 0;
        $skipped = 0;

        foreach (self::PREVIEW_SLUGS as $slug) {
            $entry = Entry::query()->where('collection', 'developments')->where('slug', $slug)->first();

            if (! $entry) {
                $this->warn("Missing entry: {$slug}");
                continue;
            }

            if (in_array($slug, self::PROTECTED_SLUGS, true)) {
                $entry->set('preview_detail_page', true);
                $entry->set('template', 'development-detail');
                $entry->save();
                $this->line("{$slug}: kept curated detail content");
                $skipped++;
                continue;
            }

            if ($entry->get('full_description') && ! $force) {
                $this->line("{$slug}: skipped (already has detail content, use --force)");
                $skipped++;
                continue;
            }

            foreach ($this->buildDetailData($entry) as $key => $value) {
                $entry->set($key, $value);
            }

            $entry->save();
            $updated++;
            $this->line("{$slug}: seeded preview detail content");
        }

        $this->info("Seeded {$updated} entries, skipped {$skipped}.");

        return self::SUCCESS;
    }

    private function buildDetailData($entry): array
    {
        $title = (string) $entry->get('title', '');
        $name = trim(preg_replace('/^\([A-Z]\)\s*/', '', $title));
        $subtitle = (string) $entry->get('subtitle', 'London');
        $caption = (string) $entry->get('caption', 'Imagine Living');
        $description = (string) $entry->get('description', '');
        $priceFrom = (int) ($entry->get('price_from') ?: 350000);
        $bedrooms = (int) ($entry->get('bedrooms') ?: 2);
        $bathrooms = (int) ($entry->get('bathrooms') ?: 1);
        $sizeSqFt = (int) ($entry->get('size_sq_ft') ?: 650);
        $propertyType = (string) ($entry->get('property_type') ?: 'Apartment');
        $images = $entry->get('images', []);
        $firstImage = is_array($images) && count($images) > 0 ? $images[0] : null;
        $secondImage = is_array($images) && count($images) > 1 ? $images[1] : $firstImage;
        $thirdImage = is_array($images) && count($images) > 2 ? $images[2] : $secondImage;

        [$lat, $lng] = self::AREA_COORDS[$subtitle] ?? ['51.5074', '-0.1278'];
        $sharePercent = 25;
        $fullPrice = max($priceFrom, 350000);
        $sharePrice = (int) round($fullPrice * ($sharePercent / 100));
        $deposit = (int) round($sharePrice * 0.1);
        $rent = (int) round($fullPrice * 0.017 / 12);
        $service = (int) round(200 + ($bedrooms * 80));
        $mortgage = (int) round($sharePrice * 0.004);

        $address = "{$name}, {$subtitle}, London";
        if ($subtitle === 'Bournemouth') {
            $address = "{$name}, Bournemouth";
        }

        $summary = "Contemporary {$bedrooms}-bedroom {$propertyType} homes in {$subtitle}, offered through Shared Ownership with {$caption}.";
        $fullDescription = trim($description) !== ''
            ? $description."\n\nThis preview page shows example detail content for {$name}. Layout, panels and property cards demonstrate how a full ShareToBuy-style listing could appear on the site."
            : "A collection of modern Shared Ownership homes at {$name} in {$subtitle}. This preview page uses example content to demonstrate the internal development detail layout.";

        $stationOffset = 0.003;
        $schoolOffset = 0.005;

        return [
            'template' => 'development-detail',
            'preview_detail_page' => true,
            'scheme_type' => $entry->get('listing_status') === 'coming-soon' ? 'Shared Ownership (Coming soon)' : 'Shared Ownership',
            'price_display' => '£'.number_format($sharePrice),
            'share_pricing_note' => "Share {$sharePercent}% / Full price £".number_format($fullPrice)." / Min deposit £".number_format($deposit),
            'summary' => $summary,
            'full_description' => $fullDescription,
            'address' => $address,
            'map_latitude' => $lat,
            'map_longitude' => $lng,
            'monthly_cost_total' => '£'.number_format($rent + $service + $mortgage),
            'monthly_rent' => '£'.number_format($rent),
            'monthly_service_charge' => '£'.number_format($service),
            'monthly_mortgage' => '£'.number_format($mortgage),
            'mortgage_rate_note' => 'Calculated using a representative rate of 4.25%. This is an estimate only and not confirmation that you can obtain a mortgage.',
            'floor_plan' => $firstImage,
            'stations' => [
                [
                    'id' => 'st1',
                    'type' => 'station',
                    'enabled' => true,
                    'name' => 'Local station',
                    'distance' => '0.3 miles',
                    'latitude' => (string) round((float) $lat + $stationOffset, 4),
                    'longitude' => (string) round((float) $lng + $stationOffset, 4),
                ],
                [
                    'id' => 'st2',
                    'type' => 'station',
                    'enabled' => true,
                    'name' => 'Zone 2 interchange',
                    'distance' => '0.6 miles',
                    'latitude' => (string) round((float) $lat - $stationOffset, 4),
                    'longitude' => (string) round((float) $lng + ($stationOffset * 2), 4),
                ],
            ],
            'schools' => [
                [
                    'id' => 'sch1',
                    'type' => 'school',
                    'enabled' => true,
                    'name' => 'Local primary school',
                    'distance' => '0.4 miles',
                    'latitude' => (string) round((float) $lat + $schoolOffset, 4),
                    'longitude' => (string) round((float) $lng - $schoolOffset, 4),
                ],
                [
                    'id' => 'sch2',
                    'type' => 'school',
                    'enabled' => true,
                    'name' => 'Secondary school',
                    'distance' => '0.8 miles',
                    'latitude' => (string) round((float) $lat - $schoolOffset, 4),
                    'longitude' => (string) round((float) $lng + $schoolOffset, 4),
                ],
            ],
            'eligibility_items' => [
                ['id' => 'el1', 'type' => 'item', 'enabled' => true, 'text' => 'Your income is £90,000 a year or less.'],
                ['id' => 'el2', 'type' => 'item', 'enabled' => true, 'text' => 'You are a first-time buyer, or you used to own a home but cannot afford to buy one now.'],
                ['id' => 'el3', 'type' => 'item', 'enabled' => true, 'text' => 'You can purchase a minimum share of 25% up to a maximum share of 75%.'],
            ],
            'highlights' => [
                ['id' => 'hi1', 'type' => 'highlight', 'enabled' => true, 'title' => 'Modern living spaces', 'description' => "Bright open-plan layouts designed for everyday life at {$name}."],
                ['id' => 'hi2', 'type' => 'highlight', 'enabled' => true, 'title' => 'Well connected', 'description' => "Excellent transport links in and around {$subtitle}."],
                ['id' => 'hi3', 'type' => 'highlight', 'enabled' => true, 'title' => 'Local amenities', 'description' => 'Shops, cafés and green spaces within easy reach.'],
            ],
            'key_features' => [
                ['id' => 'kf1', 'type' => 'feature', 'enabled' => true, 'text' => "{$bedrooms} bedroom {$propertyType} layouts"],
                ['id' => 'kf2', 'type' => 'feature', 'enabled' => true, 'text' => 'Shared Ownership available'],
                ['id' => 'kf3', 'type' => 'feature', 'enabled' => true, 'text' => 'Secure modern building'],
            ],
            'material_information' => [
                ['id' => 'mi1', 'type' => 'row', 'enabled' => true, 'label' => 'Bedrooms', 'value' => (string) $bedrooms],
                ['id' => 'mi2', 'type' => 'row', 'enabled' => true, 'label' => 'Bathrooms', 'value' => (string) $bathrooms],
                ['id' => 'mi3', 'type' => 'row', 'enabled' => true, 'label' => 'Property type', 'value' => $propertyType],
                ['id' => 'mi4', 'type' => 'row', 'enabled' => true, 'label' => 'Size', 'value' => "{$sizeSqFt} sq ft"],
                ['id' => 'mi5', 'type' => 'row', 'enabled' => true, 'label' => 'Tenure', 'value' => 'Leasehold'],
            ],
            'estimated_costs' => [
                ['id' => 'ec1', 'type' => 'cost', 'enabled' => true, 'label' => 'Service charge', 'value' => '£'.number_format($service).' pcm'],
                ['id' => 'ec2', 'type' => 'cost', 'enabled' => true, 'label' => 'Monthly rent', 'value' => '£'.number_format($rent).' pcm'],
                ['id' => 'ec3', 'type' => 'cost', 'enabled' => true, 'label' => 'Ground rent', 'value' => '£250 pa'],
            ],
            'property_units' => [
                [
                    'id' => 'pu1',
                    'type' => 'unit',
                    'enabled' => true,
                    'unit_address' => $address,
                    'floor' => '1st Floor',
                    'scheme_type' => 'Shared Ownership',
                    'unit_description' => "Example {$bedrooms}-bedroom home at {$name} with open-plan living and contemporary finishes.",
                    'unit_price' => '£'.number_format($sharePrice),
                    'unit_price_note' => "Share {$sharePercent}% / Full price £".number_format($fullPrice)." / Min deposit £".number_format($deposit),
                    'unit_status' => $entry->get('listing_status') === 'sold' ? 'sold' : 'for-sale',
                    'property_type' => $propertyType,
                    'bedrooms' => $bedrooms,
                    'bathrooms' => $bathrooms,
                    'size_sq_ft' => $sizeSqFt,
                    'monthly_rent' => '£'.number_format($rent).' pcm',
                    'service_charge' => '£'.number_format($service).' pcm',
                    'ground_rent' => '£250 pa',
                    'unit_image' => $firstImage,
                ],
                [
                    'id' => 'pu2',
                    'type' => 'unit',
                    'enabled' => true,
                    'unit_address' => $address,
                    'floor' => '2nd Floor',
                    'scheme_type' => 'Shared Ownership',
                    'unit_description' => 'Second example unit demonstrating the property card layout on the detail page.',
                    'unit_price' => '£'.number_format((int) round($sharePrice * 0.85)),
                    'unit_price_note' => 'Share 25% / Example pricing for preview only',
                    'unit_status' => 'for-sale',
                    'property_type' => $propertyType,
                    'bedrooms' => max(1, $bedrooms - 1),
                    'bathrooms' => $bathrooms,
                    'size_sq_ft' => max(450, (int) round($sizeSqFt * 0.8)),
                    'monthly_rent' => '£'.number_format((int) round($rent * 0.85)).' pcm',
                    'service_charge' => '£'.number_format((int) round($service * 0.9)).' pcm',
                    'ground_rent' => '£200 pa',
                    'unit_image' => $secondImage,
                ],
                [
                    'id' => 'pu3',
                    'type' => 'unit',
                    'enabled' => true,
                    'unit_address' => $address,
                    'floor' => '3rd Floor',
                    'scheme_type' => 'Shared Ownership',
                    'unit_description' => 'Additional example unit shown as sold to demonstrate status styling.',
                    'unit_price' => '£'.number_format((int) round($sharePrice * 0.7)),
                    'unit_price_note' => 'Share 25% / Example pricing for preview only',
                    'unit_status' => 'sold',
                    'property_type' => $propertyType,
                    'bedrooms' => $bedrooms,
                    'bathrooms' => $bathrooms,
                    'size_sq_ft' => $sizeSqFt,
                    'monthly_rent' => '£'.number_format($rent).' pcm',
                    'service_charge' => '£'.number_format($service).' pcm',
                    'ground_rent' => '£250 pa',
                    'unit_image' => $thirdImage,
                ],
            ],
        ];
    }
}
