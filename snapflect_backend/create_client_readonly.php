<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$role = DB::table('roles')->where('role_code', 'READ_ONLY')->first();
$user = App\Modules\Security\Models\User::create([
    'organization_id' => 2, 
    'business_unit_id' => 2, 
    'department_id' => 2, 
    'location_id' => 2, 
    'first_name' => 'Client', 
    'last_name' => 'ReadOnly', 
    'email' => 'client_readonly@test.com', 
    'password' => Hash::make('password')
]);
DB::table('user_roles')->insert(['user_id' => $user->id, 'role_id' => $role->id]);
echo 'User created';
