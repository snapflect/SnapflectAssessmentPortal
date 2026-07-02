<?php
declare(strict_types=1);
namespace Tests\Unit\Repositories\Security;
use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Security\Repositories\UserRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private UserRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->app->make(UserRepository::class);
    }

    public function test_it_filters_soft_deleted_users(): void
    {
        // Arrange
        $activeUser = User::factory()->create(['is_deleted' => false]);
        $deletedUser = User::factory()->create(['is_deleted' => true, 'deleted_date' => now()]);

        // Act
        $users = $this->repository->paginate(15);

        // Assert
        $this->assertContains($activeUser->id, $users->pluck('id'));
        $this->assertNotContains($deletedUser->id, $users->pluck('id'));
    }
}
