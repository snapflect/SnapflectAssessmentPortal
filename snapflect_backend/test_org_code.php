<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Modules\Governance\Models\Organization;
use App\Modules\Governance\Services\OrganizationService;
use App\Modules\Governance\DTOs\CreateOrganizationDto;
use Illuminate\Support\Facades\DB;

// Disable event dispatching for tenant provisioning to avoid side effects during this unit test script
Organization::unsetEventDispatcher();

DB::beginTransaction();
try {
    $service = app(OrganizationService::class);
    
    // Create org with no code
    $dto = CreateOrganizationDto::fromArray([
        'organization_name' => 'Acme Test Corp',
        'tenant_type' => 'enterprise'
    ]);
    
    $org1 = $service->create($dto, 1);
    echo "Org 1 Code: " . $org1->organization_code . "\n";
    
    // Soft delete it
    $service->delete($org1->uuid, 1);
    
    // Refresh model to check archived code
    $org1->refresh();
    echo "Org 1 Archived Code: " . $org1->organization_code . "\n";
    
    // Create another with same name
    $org2 = $service->create($dto, 1);
    echo "Org 2 Code: " . $org2->organization_code . "\n";
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n" . $e->getTraceAsString();
} finally {
    DB::rollBack();
}
