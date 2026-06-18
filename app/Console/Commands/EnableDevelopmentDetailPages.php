<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class EnableDevelopmentDetailPages extends Command
{
    protected $signature = 'developments:enable-detail-pages';

    protected $description = 'Set development-detail template on all development entries';

    public function handle(): int
    {
        $directory = base_path('content/collections/developments');
        $updated = 0;

        foreach (glob($directory.'/*.md') as $file) {
            $content = file_get_contents($file);

            if (str_contains($content, 'template: development-detail')) {
                continue;
            }

            $content = preg_replace(
                '/(blueprint: development\r?\n)/',
                "$1template: development-detail\n",
                $content,
                1,
                $count
            );

            if ($count === 0) {
                $this->warn('Skipped: '.basename($file));

                continue;
            }

            file_put_contents($file, $content);
            $updated++;
        }

        $this->info("Updated {$updated} development entries.");

        return self::SUCCESS;
    }
}
