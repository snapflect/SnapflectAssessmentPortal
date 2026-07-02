<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Services;

use Tests\TestCase;
use App\Modules\Delivery\Services\RandomizationEngineService;
use App\Modules\Delivery\Services\SeedGenerationService;
use App\Modules\Delivery\Services\QuestionRandomizationService;
use App\Modules\Delivery\Services\OptionRandomizationService;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Delivery\Exceptions\RandomizationException;
use Illuminate\Support\Str;

class RandomizationEngineServiceTest extends TestCase
{
    private RandomizationEngineService $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        $seedService = new SeedGenerationService();
        $questionService = new QuestionRandomizationService();
        $optionService = new OptionRandomizationService();
        
        $this->service = new RandomizationEngineService($seedService, $questionService, $optionService);
    }

    private function getMockSnapshotPayload(): array
    {
        return [
            'blueprint' => [
                'sections' => [
                    [
                        'uuid' => 'sec-1',
                        'questions' => [
                            [
                                'uuid' => 'q-1',
                                'options' => [
                                    ['uuid' => 'opt-1a', 'is_correct' => true],
                                    ['uuid' => 'opt-1b', 'is_correct' => false],
                                    ['uuid' => 'opt-1c', 'is_correct' => false],
                                ]
                            ],
                            [
                                'uuid' => 'q-2',
                                'options' => [
                                    ['uuid' => 'opt-2a', 'is_correct' => false],
                                    ['uuid' => 'opt-2b', 'is_correct' => true],
                                    ['uuid' => 'opt-2c', 'is_correct' => false],
                                ]
                            ],
                            [
                                'uuid' => 'q-3',
                                'options' => [
                                    ['uuid' => 'opt-3a', 'is_correct' => false],
                                    ['uuid' => 'opt-3b', 'is_correct' => false],
                                    ['uuid' => 'opt-3c', 'is_correct' => true],
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }

    public function test_seed_generation_is_deterministic()
    {
        $seedService = new SeedGenerationService();
        $assUuid = Str::uuid()->toString();
        $candUuid = Str::uuid()->toString();
        $sessUuid = Str::uuid()->toString();

        $seed1 = $seedService->generate($assUuid, $candUuid, $sessUuid);
        $seed2 = $seedService->generate($assUuid, $candUuid, $sessUuid);

        $this->assertEquals($seed1, $seed2);
        $this->assertEquals(64, strlen($seed1)); // SHA-256
    }

    public function test_same_seed_produces_same_order()
    {
        $snapshot = new AssessmentSnapshot();
        $snapshot->snapshot_json = json_encode($this->getMockSnapshotPayload());
        
        $assessment = new Assessment();
        $assessment->uuid = Str::uuid()->toString();
        $assessment->randomize_questions = true;
        $assessment->randomize_options = true;

        $sessUuid = Str::uuid()->toString();
        $candUuid = Str::uuid()->toString();

        $result1 = $this->service->execute($snapshot, $assessment, $sessUuid, $candUuid);
        $result2 = $this->service->execute($snapshot, $assessment, $sessUuid, $candUuid);

        $this->assertEquals($result1['question_order_json'], $result2['question_order_json']);
        $this->assertEquals($result1['option_order_json'], $result2['option_order_json']);
        $this->assertEquals($result1['seed'], $result2['seed']);
    }

    public function test_different_seed_produces_different_order()
    {
        $snapshot = new AssessmentSnapshot();
        $snapshot->snapshot_json = json_encode($this->getMockSnapshotPayload());
        
        $assessment1 = new Assessment();
        $assessment1->uuid = Str::uuid()->toString(); // Different UUID = different seed
        $assessment1->randomize_questions = true;
        $assessment1->randomize_options = true;

        $assessment2 = new Assessment();
        $assessment2->uuid = Str::uuid()->toString();
        $assessment2->randomize_questions = true;
        $assessment2->randomize_options = true;

        $sessUuid = Str::uuid()->toString();
        $candUuid = Str::uuid()->toString();

        $result1 = $this->service->execute($snapshot, $assessment1, $sessUuid, $candUuid);
        $result2 = $this->service->execute($snapshot, $assessment2, $sessUuid, $candUuid);

        $this->assertNotEquals($result1['seed'], $result2['seed']);
        // Given 3 questions, high probability of different order. 
        // Hash collisions for sorting 3 elements differently with completely different seeds are practically zero.
        $this->assertNotEquals($result1['question_order_json'], $result2['question_order_json']);
    }

    public function test_option_correctness_metadata_is_preserved()
    {
        $snapshot = new AssessmentSnapshot();
        $payload = $this->getMockSnapshotPayload();
        $snapshot->snapshot_json = json_encode($payload);
        
        $assessment = new Assessment();
        $assessment->uuid = Str::uuid()->toString();
        $assessment->randomize_questions = true;
        $assessment->randomize_options = true;

        $result = $this->service->execute($snapshot, $assessment, Str::uuid()->toString(), Str::uuid()->toString());

        $orderedOptions = json_decode($result['option_order_json'], true);
        
        // Find q-1 which originally had opt-1a as correct
        $q1 = null;
        foreach ($orderedOptions[0]['questions'] as $q) {
            if ($q['uuid'] === 'q-1') {
                $q1 = $q;
                break;
            }
        }

        $this->assertNotNull($q1);
        $this->assertCount(3, $q1['options']);

        // Verify that opt-1a is still flagged as correct, and others false
        foreach ($q1['options'] as $opt) {
            if ($opt['uuid'] === 'opt-1a') {
                $this->assertTrue($opt['is_correct']);
            } else {
                $this->assertFalse($opt['is_correct']);
            }
        }
    }
}
