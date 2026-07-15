<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$roles = \App\Modules\Security\Models\Role::get(['role_code', 'organization_id']);
echo "Roles:\n";
foreach($roles as $r) {
    echo $r->role_code . " (Org: " . ($r->organization_id ?? 'global') . ")\n";
}
