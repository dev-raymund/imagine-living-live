<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class DisableDevelopmentDetailPages extends Command
{
    protected $signature = 'developments:disable-detail-pages {--except=a-cityview-point}';

    protected $description = 'Remove development-detail template from entries except the preview slug';

    public function handle(): int
    {
        $except = $this->option('except');
        $directory = base_path('content/collections/developments');
        $updated = 0;

        foreach (glob($directory.'/*.md') as $file) {
            $slug = basename($file, '.md');

            if ($slug === $except) {
                continue;
            }

            $content = file_get_contents($file);

            if (! str_contains($content, 'template: development-detail')) {
                continue;
            }

            $content = preg_replace('/^template: development-detail\r?\n/m', '', $content);
            file_put_contents($file, $content);
            $updated++;
        }

        $this->info("Removed development-detail template from {$updated} entries.");

        return self::SUCCESS;
    }
}
