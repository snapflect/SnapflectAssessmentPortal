<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Modules\Governance\Models\BusinessUnit;

$bu = BusinessUnit::withTrashed()->where('business_unit_code', 'TestBU03')->first();
echo 'Code: ' . ($bu ? $bu->business_unit_code : 'Not found') . "\n";
echo 'Deleted: ' . ($bu ? $bu->deleted_date : 'N/A') . "\n";
