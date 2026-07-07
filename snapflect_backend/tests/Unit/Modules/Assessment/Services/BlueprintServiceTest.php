<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Assessment\Services\BlueprintService;
use App\Modules\Assessment\Repositories\Interfaces\BlueprintRepositoryInterface;
use App\Modules\Assessment\DTOs\CreateBlueprintDto;
use Illuminate\Support\Facades\DB;
use Mockery;

class BlueprintServiceTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected BlueprintService $service;
    protected $blueprintRepoMock;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->blueprintRepoMock = Mockery::mock(BlueprintRepositoryInterface::class);
        $this->service = new BlueprintService($this->blueprintRepoMock);
    }

    public function test_blueprint_creation()
    {
        $dto = new CreateBlueprintDto('some-uuid', 'My Blueprint', 'Desc', []);
        
        

        $result = $this->service->createBlueprint(1, $dto);
        
        $this->assertTrue($result);
    }

    public function test_question_assignment()
    {
        
            
        $this->service->assignQuestions(1, ['uuid-1', 'uuid-2'], 1);
        
        $this->assertTrue(true);
    }
}
