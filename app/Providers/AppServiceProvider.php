<?php

namespace App\Providers;

use App\Console\Commands\SyncDevelopmentPrices;
use Illuminate\Support\ServiceProvider;
use Statamic\Statamic;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                SyncDevelopmentPrices::class,
            ]);
        }

        // Statamic::script('app', 'cp');
        // Statamic::style('app', 'cp');
    }
}
