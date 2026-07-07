<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Results;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;

class ReportingApiTest extends TestCase
{
    use RefreshDatabase;

    private function createReportingUser(): User
    {
        $user = User::factory()->create();
        $role = Role::factory()->create(['role_code' => 'PLATFORM_ADMIN']);
        $user->roles()->attach($role);
        return $user;
    }

    public function test_can_fetch_pass_fail_report(): void
    {
        $user = $this->createReportingUser();
        $this->actingAs($user);

        $response = $this->getJson('/api/v1/results/reports/pass-fail');

        $response->assertStatus(200);
    }
}
