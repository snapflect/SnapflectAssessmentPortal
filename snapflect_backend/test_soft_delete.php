<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Modules\Governance\Models\Organization;
use App\Modules\Governance\Models\BusinessUnit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

DB::beginTransaction();
try {
    // get a random org
    $org = Organization::first();
    
    // Create a BU
    $bu = BusinessUnit::create([
        'uuid' => Str::uuid()->toString(),
        'organization_id' => $org->id,
        'business_unit_code' => 'test-bu-xxx',
        'business_unit_name' => 'Test BU XXX',
        'created_by' => 1,
        'modified_by' => 1,
    ]);
    
    echo "Created BU code: " . $bu->business_unit_code . "\n";
    
    // Delete it
    $bu->delete();
    
    // Fetch it again to see what the code is in the DB
    $deletedBu = BusinessUnit::withTrashed()->find($bu->id);
    echo "Deleted BU code in DB: " . $deletedBu->business_unit_code . "\n";
    echo "Deleted BU deleted_date: " . $deletedBu->deleted_date . "\n";
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n" . $e->getTraceAsString();
} finally {
    DB::rollBack();
}
