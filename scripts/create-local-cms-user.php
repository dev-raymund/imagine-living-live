<?php

/**
 * One-time local CMS login. Run: php scripts/create-local-cms-user.php
 */

use Statamic\Facades\User;

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$email = 'local-dev@imagineliving.test';
$password = 'LocalDev123!';

$user = User::findByEmail($email);

if (! $user) {
    $user = User::make()
        ->email($email)
        ->data(['name' => 'Local Dev']);
    $user->makeSuper();
}

$user->password($password);
$user->save();

echo "Local CMS user ready.\n";
echo "  URL:      http://127.0.0.1:8000/cms/auth/login\n";
echo "  Email:    {$email}\n";
echo "  Password: {$password}\n";
