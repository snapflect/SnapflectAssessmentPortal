<?php
// Run from backend root: php diag_onboarding.php
chdir(__DIR__);
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$orgCode = 'tttt';

echo "============================================================\n";
echo " ONBOARDING VERIFICATION REPORT — org_code: $orgCode\n";
echo "============================================================\n\n";

// 1. Organization
echo "[ 1 ] ORGANIZATION\n";
$org = DB::table('organizations')->where('organization_code', $orgCode)->first();
if (!$org) {
    echo "  ❌  Not found in organizations table.\n\n";
    exit(1);
}
echo "  ✅  id={$org->id}  uuid={$org->uuid}\n";
echo "      name={$org->organization_name}  code={$org->organization_code}\n";
echo "      contact_email={$org->contact_email}\n";
echo "      created_at=" . ($org->created_at ?? $org->created_date ?? 'N/A') . "\n\n";

// 2. Tenant
echo "[ 2 ] TENANT (Stancl Tenancy)\n";
$tenantId = strtolower($org->organization_code ?? $org->uuid);
$tenant = DB::table('tenants')->where('id', $tenantId)->first();
if (!$tenant) {
    echo "  ❌  No tenant row found for id='$tenantId'\n\n";
} else {
    echo "  ✅  tenant.id={$tenant->id}\n";
    $data = json_decode($tenant->data, true);
    echo "      data=" . json_encode($data) . "\n\n";
}

// 3. Domain
echo "[ 3 ] DOMAIN\n";
$domain = DB::table('domains')->where('tenant_id', $tenantId)->first();
if (!$domain) {
    echo "  ❌  No domain row found for tenant_id='$tenantId'\n\n";
} else {
    echo "  ✅  domain={$domain->domain}  tenant_id={$domain->tenant_id}\n\n";
}

// 4. Tenant SQLite DB file
echo "[ 4 ] TENANT DATABASE FILE\n";
$dbName = 'tenant' . $tenantId;   // matches stancl prefix logic
$dbFile = database_path($dbName);
if (file_exists($dbFile)) {
    echo "  ✅  File exists: $dbFile (" . round(filesize($dbFile)/1024, 2) . " KB)\n";
    // Check tables inside tenant DB
    try {
        $pdo = new PDO('sqlite:' . $dbFile);
        $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);
        echo "      Tables in tenant DB: " . count($tables) . "\n";
        echo "      [" . implode(', ', $tables) . "]\n\n";
    } catch (Exception $e) {
        echo "  ⚠️  Could not open tenant DB: " . $e->getMessage() . "\n\n";
    }
} else {
    echo "  ❌  File NOT found at: $dbFile\n\n";
}

// 5. Subscription
echo "[ 5 ] SUBSCRIPTION\n";
$sub = DB::table('tenant_subscriptions')->where('organization_id', $org->id)->first();
if (!$sub) {
    echo "  ❌  No subscription found for organization_id={$org->id}\n\n";
} else {
    $plan = DB::table('subscription_plans')->find($sub->plan_id);
    echo "  ✅  subscription.id={$sub->id}  status={$sub->status}\n";
    echo "      plan=" . ($plan->plan_code ?? 'N/A') . " ({$plan->plan_name})\n";
    echo "      starts_at={$sub->starts_at}  ends_at={$sub->ends_at}\n\n";
}

// 6. Invoice
echo "[ 6 ] INVOICE\n";
$invoice = DB::table('invoices')->where('organization_id', $org->id)->first();
if (!$invoice) {
    echo "  ❌  No invoice found for organization_id={$org->id}\n\n";
} else {
    echo "  ✅  invoice.id={$invoice->id}  status={$invoice->status}\n";
    echo "      amount={$invoice->amount}  currency={$invoice->currency}\n\n";
}

// 7. Summary
echo "============================================================\n";
echo " SUMMARY\n";
echo "============================================================\n";
$checks = [
    'Organization created'     => !empty($org),
    'Tenant row created'       => !empty($tenant),
    'Domain row created'       => !empty($domain),
    'Tenant DB file on disk'   => file_exists($dbFile),
    'Subscription assigned'    => !empty($sub),
    'Invoice generated'        => !empty($invoice),
];
$pass = 0;
foreach ($checks as $label => $result) {
    $icon = $result ? '✅' : '❌';
    echo "  $icon  $label\n";
    if ($result) $pass++;
}
echo "\n  SCORE: $pass/" . count($checks) . " checks passed\n";
echo "============================================================\n";
