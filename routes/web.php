<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::statamic('example', 'example-view', [
//    'title' => 'Example'
// ]);

if (app()->environment('local')) {
    URL::forceScheme('http');
} else {
    URL::forceScheme('https');
}

/*
 * A bedroom configuration within a development, e.g.
 * /developments/acton-lane/properties/2-bedroom
 *
 * Registered ahead of Statamic's own routing. The developments collection route
 * is only two segments deep, so there is no conflict with /developments/{slug}.
 */
Route::get(
    '/developments/{development}/properties/{variant}',
    [\App\Http\Controllers\DevelopmentPropertyController::class, 'show']
)->name('development.property');
