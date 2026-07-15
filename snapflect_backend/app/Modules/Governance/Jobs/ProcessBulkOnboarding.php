<?php

namespace App\Modules\Governance\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Modules\Security\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProcessBulkOnboarding implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $tenantId,
        public string $filePath
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Switch to tenant context
        tenancy()->initialize($this->tenantId);

        $tenant = tenant();
        $organizationId = $tenant->organization_id;

        $path = storage_path('app/' . $this->filePath);
        if (!file_exists($path)) {
            return;
        }

        $file = fopen($path, 'r');
        $header = fgetcsv($file); // Assume standard headers: first_name, last_name, email, role

        while (($row = fgetcsv($file)) !== false) {
            if (count($header) !== count($row)) continue;

            $data = array_combine($header, $row);

            // 1. Create or get user in Central DB
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'uuid' => (string) Str::uuid(),
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'organization_id' => $organizationId,
                    'password' => Hash::make(Str::random(12)), // Require password reset later
                ]
            );

            // 2. Map Role inside Tenant DB
            if (!empty($data['role'])) {
                $roleName = trim($data['role']);
                $role = Role::firstOrCreate([
                    'role_name' => $roleName,
                    'organization_id' => $organizationId
                ], [
                    'uuid' => (string) Str::uuid(),
                    'status' => 'ACTIVE'
                ]);

                // 3. Link User to Role in Tenant DB (user_roles table)
                \Illuminate\Support\Facades\DB::table('user_roles')->updateOrInsert(
                    ['user_id' => $user->id, 'role_id' => $role->id],
                    ['uuid' => (string) Str::uuid(), 'created_date' => now()]
                );
            }
        }

        fclose($file);
        
        // Optionally delete the file after processing
        // Storage::disk('local')->delete($this->filePath);
        
        tenancy()->end();
    }
}
