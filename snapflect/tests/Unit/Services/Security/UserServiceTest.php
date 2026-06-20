<?php
declare(strict_types=1);
namespace Tests\Unit\Services\Security;
use Tests\TestCase;
use App\Modules\Security\Services\UserService;
use App\Modules\Security\DTOs\CreateUserDto;
use App\Core\Exceptions\TenantValidationException;
use App\Modules\Governance\Models\Organization;
use App\Modules\Governance\Models\BusinessUnit;
use App\Modules\Security\Repositories\UserRepositoryInterface;
use App\Modules\Governance\Repositories\OrganizationRepositoryInterface;
use App\Modules\Governance\Repositories\BusinessUnitRepositoryInterface;
use Mockery;
use Illuminate\Support\Facades\DB;

class UserServiceTest extends TestCase
{
    public function test_it_throws_tenant_exception_if_business_unit_mismatch(): void
    {
        // Arrange
        $orgRepo = Mockery::mock(OrganizationRepositoryInterface::class);
        $buRepo = Mockery::mock(BusinessUnitRepositoryInterface::class);
        
        $orgRepo->shouldReceive('findById')->with(1)->andReturn(new Organization(['id' => 1]));
        $buRepo->shouldReceive('findById')->with(99)->andReturn(new BusinessUnit(['id' => 99, 'organization_id' => 2])); // Mismatch!

        $service = new UserService(
            Mockery::mock(UserRepositoryInterface::class),
            Mockery::mock(\App\Modules\Security\Repositories\RoleRepositoryInterface::class),
            $orgRepo,
            $buRepo,
            Mockery::mock(\App\Modules\Governance\Repositories\DepartmentRepositoryInterface::class),
            Mockery::mock(\App\Modules\Governance\Repositories\LocationRepositoryInterface::class)
        );

        $dto = new CreateUserDto(
            organization_id: 1,
            business_unit_id: 99,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            password: 'Password123!'
        );

        // Assert
        $this->expectException(TenantValidationException::class);
        $this->expectExceptionMessage('BusinessUnit does not belong to the specified Organization.');

        // Act
        $service->create($dto, 1);
    }
}
