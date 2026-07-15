<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$org = \App\Modules\Governance\Models\Organization::where('organization_name', 'Demo Client')->orderBy('id', 'desc')->first();
if ($org) {
    echo "Organization: " . $org->organization_name . "\n";
    echo "Contact Email: " . $org->contact_email . "\n";
    echo "Tenant ID: " . ($org->organization_code ?? $org->uuid) . "\n";
    
    $users = \App\Modules\Security\Models\User::where('organization_id', $org->id)->get();
    echo "Users for this org:\n";
    foreach ($users as $user) {
        echo "- " . $user->email . " (Status: " . $user->status . ")\n";
    }

    echo "\nFailed Jobs:\n";
    $failed = \Illuminate\Support\Facades\DB::table('failed_jobs')->get();
    foreach ($failed as $f) {
        echo $f->id . " - " . $f->exception . "\n";
    }
} else {
    echo "Organization 'Demo Client' not found.\n";
}
