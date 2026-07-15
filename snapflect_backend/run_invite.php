<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$org = \App\Modules\Governance\Models\Organization::where('organization_name', 'Demo Client')->orderBy('id', 'desc')->first();
if ($org) {
    echo "Organization: " . $org->organization_name . "\n";
    
    // We will clear the failed jobs to avoid confusion
    \Illuminate\Support\Facades\DB::table('failed_jobs')->truncate();
    
    // Manually run the handle method
    try {
        $job = new \App\Jobs\ProvisionTenantUsersJob($org);
        $job->handle(app(\App\Modules\Security\Services\UserInvitationService::class));
        echo "Job ran successfully.\n";
    } catch (\Exception $e) {
        echo "Job failed: " . $e->getMessage() . "\n";
    }

    $users = \App\Modules\Security\Models\User::where('organization_id', $org->id)->get();
    echo "\nUsers for this org:\n";
    foreach ($users as $user) {
        echo "- " . $user->email . " (Status: " . $user->status . ")\n";
    }

} else {
    echo "Organization 'Demo Client' not found.\n";
}
