<?php

$baseDir = __DIR__ . '/snapflect/database';
if (!is_dir("$baseDir/migrations")) {
    mkdir("$baseDir/migrations", 0777, true);
}
if (!is_dir("$baseDir/seeders")) {
    mkdir("$baseDir/seeders", 0777, true);
}

$migrations = [
    '2026_06_20_000001_create_sessions_table.php' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};
PHP,

    '2026_06_20_000002_create_personal_access_tokens_table.php' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};
PHP,

    '2026_06_20_000003_create_organizations_table.php' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('organization_code', 50)->unique();
            $table->string('organization_name', 255);
            $table->string('status', 50)->default('ACTIVE');
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();
            
            $table->index('organization_code');
            $table->index('status');
            $table->index('is_deleted');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
PHP,

    '2026_06_20_000004_create_business_units_table.php' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_units', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations');
            $table->string('business_unit_code', 50);
            $table->string('business_unit_name', 255);
            $table->string('status', 50)->default('ACTIVE');
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();
            
            $table->unique(['organization_id', 'business_unit_code']);
            $table->index('status');
            $table->index('is_deleted');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_units');
    }
};
PHP,

    '2026_06_20_000005_create_departments_table.php' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations');
            $table->foreignId('business_unit_id')->nullable()->constrained('business_units');
            $table->string('department_code', 50);
            $table->string('department_name', 255);
            $table->string('status', 50)->default('ACTIVE');
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();
            
            $table->unique(['organization_id', 'department_code']);
            $table->index('status');
            $table->index('is_deleted');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
PHP,

    '2026_06_20_000006_create_locations_table.php' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations');
            $table->string('location_code', 50);
            $table->string('location_name', 255);
            $table->string('address', 500)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('status', 50)->default('ACTIVE');
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();
            
            $table->unique(['organization_id', 'location_code']);
            $table->index('status');
            $table->index('is_deleted');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
PHP,

    '2026_06_20_000007_create_users_table.php' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations');
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email', 255)->unique();
            $table->string('password', 255);
            $table->string('status', 50)->default('ACTIVE');
            $table->dateTime('last_login_at')->nullable();
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();
            
            $table->index('email');
            $table->index('status');
            $table->index('is_deleted');
        });
        
        // Now that users table exists, add foreign keys to the audit fields
        Schema::table('organizations', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('modified_by')->references('id')->on('users');
            $table->foreign('deleted_by')->references('id')->on('users');
        });
        Schema::table('business_units', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('modified_by')->references('id')->on('users');
            $table->foreign('deleted_by')->references('id')->on('users');
        });
        Schema::table('departments', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('modified_by')->references('id')->on('users');
            $table->foreign('deleted_by')->references('id')->on('users');
        });
        Schema::table('locations', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('modified_by')->references('id')->on('users');
            $table->foreign('deleted_by')->references('id')->on('users');
        });
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('modified_by')->references('id')->on('users');
            $table->foreign('deleted_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
PHP,

    '2026_06_20_000008_create_roles_table.php' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->nullable()->constrained('organizations');
            $table->string('role_code', 50);
            $table->string('role_name', 100);
            $table->text('description')->nullable();
            $table->boolean('is_system_role')->default(false);
            $table->string('status', 50)->default('ACTIVE');
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();
            
            $table->unique(['organization_id', 'role_code']);
            
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('modified_by')->references('id')->on('users');
            $table->foreign('deleted_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
PHP,

    '2026_06_20_000009_create_permissions_table.php' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('permission_code', 100)->unique();
            $table->string('module', 100);
            $table->string('description', 255)->nullable();
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            
            $table->foreign('created_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
PHP,

    '2026_06_20_000010_create_role_permissions_table.php' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->foreignId('permission_id')->constrained('permissions')->onDelete('cascade');
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            
            $table->unique(['role_id', 'permission_id']);
            $table->foreign('created_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};
PHP,

    '2026_06_20_000011_create_user_roles_table.php' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            
            $table->unique(['user_id', 'role_id']);
            $table->foreign('created_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_roles');
    }
};
PHP,

    '2026_06_20_000012_create_user_profiles_table.php' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('profile_photo_url', 500)->nullable();
            $table->string('company', 255)->nullable();
            $table->string('designation', 255)->nullable();
            $table->decimal('years_of_experience', 5, 2)->nullable();
            $table->text('technology_expertise')->nullable();
            $table->string('country', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->text('bio')->nullable();
            $table->decimal('profile_completion_percentage', 5, 2)->default(0);
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();
            
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('modified_by')->references('id')->on('users');
            $table->foreign('deleted_by')->references('id')->on('users');
            
            $table->index('country');
            $table->index('state');
            $table->index('city');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
PHP,

    '2026_06_20_000013_create_password_reset_tokens_table.php' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
    }
};
PHP,
];

$seeders = [
    'DatabaseSeeder.php' => <<<'PHP'
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            OrganizationSeeder::class,
            CustomRbacSeeder::class,
            UserSeeder::class,
        ]);
    }
}
PHP,

    'OrganizationSeeder.php' => <<<'PHP'
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        $orgId = DB::table('organizations')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_code' => 'ORG-001',
            'organization_name' => 'Snapflect Assessment Portal',
            'status' => 'ACTIVE',
            'created_date' => now(),
        ]);

        $buId = DB::table('business_units')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_id' => $orgId,
            'business_unit_code' => 'BU-001',
            'business_unit_name' => 'Core Operations',
            'status' => 'ACTIVE',
            'created_date' => now(),
        ]);

        DB::table('departments')->insert([
            'uuid' => Str::uuid(),
            'organization_id' => $orgId,
            'business_unit_id' => $buId,
            'department_code' => 'DEPT-001',
            'department_name' => 'Engineering',
            'status' => 'ACTIVE',
            'created_date' => now(),
        ]);

        DB::table('locations')->insert([
            'uuid' => Str::uuid(),
            'organization_id' => $orgId,
            'location_code' => 'LOC-001',
            'location_name' => 'Headquarters',
            'city' => 'San Francisco',
            'country' => 'USA',
            'status' => 'ACTIVE',
            'created_date' => now(),
        ]);
    }
}
PHP,

    'CustomRbacSeeder.php' => <<<'PHP'
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CustomRbacSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'PLATFORM_ADMIN' => 'Platform Administrator',
            'ASSESSMENT_MANAGER' => 'Assessment Manager',
            'CONTENT_CREATOR' => 'Content Creator',
            'REVIEWER' => 'Reviewer',
            'CANDIDATE' => 'Candidate',
            'CLIENT_ADMIN' => 'Client Admin',
            'PROCTOR' => 'Proctor',
            'BILLING_ADMIN' => 'Billing Admin',
            'READ_ONLY' => 'Read Only',
            'SUPPORT' => 'Support',
        ];

        $roleIds = [];
        foreach ($roles as $code => $name) {
            $roleIds[$code] = DB::table('roles')->insertGetId([
                'uuid' => Str::uuid(),
                'role_code' => $code,
                'role_name' => $name,
                'is_system_role' => true,
                'status' => 'ACTIVE',
                'created_date' => now(),
            ]);
        }

        $permissions = [
            'Security' => ['User.View', 'User.Create', 'User.Edit', 'User.Delete', 'Role.View', 'Role.Manage'],
            'Governance' => ['Organization.View', 'Organization.Manage', 'Department.View', 'Department.Manage'],
        ];

        foreach ($permissions as $module => $perms) {
            foreach ($perms as $perm) {
                $permId = DB::table('permissions')->insertGetId([
                    'uuid' => Str::uuid(),
                    'permission_code' => $perm,
                    'module' => $module,
                    'created_date' => now(),
                ]);

                // Grant all to PLATFORM_ADMIN
                DB::table('role_permissions')->insert([
                    'role_id' => $roleIds['PLATFORM_ADMIN'],
                    'permission_id' => $permId,
                    'created_date' => now(),
                ]);
            }
        }
    }
}
PHP,

    'UserSeeder.php' => <<<'PHP'
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $orgId = DB::table('organizations')->where('organization_code', 'ORG-001')->value('id');
        $adminRoleId = DB::table('roles')->where('role_code', 'PLATFORM_ADMIN')->value('id');

        $userId = DB::table('users')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_id' => $orgId,
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'email' => 'admin@snapflect.com',
            'password' => Hash::make('Password@123!'),
            'status' => 'ACTIVE',
            'created_date' => now(),
        ]);

        DB::table('user_profiles')->insert([
            'uuid' => Str::uuid(),
            'user_id' => $userId,
            'company' => 'Snapflect',
            'designation' => 'System Administrator',
            'created_date' => now(),
        ]);

        DB::table('user_roles')->insert([
            'user_id' => $userId,
            'role_id' => $adminRoleId,
            'created_date' => now(),
        ]);
        
        // Update audit fields for the seeder data
        DB::table('organizations')->where('id', $orgId)->update(['created_by' => $userId]);
        DB::table('users')->where('id', $userId)->update(['created_by' => $userId]);
        DB::table('roles')->update(['created_by' => $userId]);
        DB::table('permissions')->update(['created_by' => $userId]);
        DB::table('role_permissions')->update(['created_by' => $userId]);
    }
}
PHP,
];

foreach ($migrations as $filename => $content) {
    file_put_contents("$baseDir/migrations/$filename", $content);
}

foreach ($seeders as $filename => $content) {
    file_put_contents("$baseDir/seeders/$filename", $content);
}

echo "Generated 13 migrations and 4 seeders successfully.";
