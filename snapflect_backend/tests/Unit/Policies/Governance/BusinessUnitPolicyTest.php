<?php
declare(strict_types=1);
namespace Tests\Unit\Policies\Governance;
use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use App\Modules\Governance\Models\BusinessUnit;
use App\Modules\Governance\Policies\BusinessUnitPolicy;

class BusinessUnitPolicyTest extends TestCase
{
    private BusinessUnitPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new BusinessUnitPolicy();
    }

    public function test_platform_admin_bypasses_checks(): void
    {
        // Arrange
        $user = new User();
        $role = new Role(['role_code' => 'PLATFORM_ADMIN']);
        $user->setRelation('roles', collect([$role]));

        // Act
        $result = $this->policy->before($user, 'update');

        // Assert
        $this->assertTrue($result);
    }

    public function test_org_admin_cannot_update_other_org_bu(): void
    {
        // Arrange
        $user = \Mockery::mock(User::class)->makePartial();
        $user->fill(['organization_id' => 1]);
        $user->shouldReceive('hasRole')->with('CLIENT_ADMIN')->andReturn(true);

        $bu = new BusinessUnit(['organization_id' => 2]); // Different Org

        // Act
        $result = $this->policy->update($user, $bu);

        // Assert
        $this->assertFalse($result);
    }
}
