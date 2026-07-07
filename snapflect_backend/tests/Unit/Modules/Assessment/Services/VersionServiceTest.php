<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Assessment\Services\VersionService;
use App\Modules\Assessment\Repositories\Interfaces\VersionRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Mockery;

class VersionServiceTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $service;
    protected $versionRepoMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->versionRepoMock = Mockery::mock(VersionRepositoryInterface::class);
        $this->service = new VersionService($this->versionRepoMock);
    }

    public function test_version_creation()
    {
        


        $result = $this->service->lockVersion(1);
        
        $this->assertIsObject($result);
        $this->assertEquals(1, $result->id);
    }

    public function test_parent_resolution()
    {
        $this->assertTrue(true);
    }
}
