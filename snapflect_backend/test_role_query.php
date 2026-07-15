<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $role = \App\Modules\Security\Models\Role::first();
    echo "Role query successful: " . ($role ? $role->role_name : "null") . "\n";
} catch (\Exception $e) {
    echo "Error querying Role: " . $e->getMessage() . "\n";
}
