<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Repositories;

use Tests\TenancyTestCase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Assessment\Repositories\Eloquent\QuestionRepository;
use App\Modules\Assessment\Models\Question;
use App\Modules\Assessment\Models\QuestionBank;

class QuestionRepositoryTest extends TenancyTestCase
{
    use WithFaker;

    protected QuestionRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new QuestionRepository(new Question());
    }

    protected function createQuestionBank(?int $orgId = null): QuestionBank
    {
        return QuestionBank::create([
            'organization_id' => $orgId ?? $this->organization->id,
            'bank_code' => $this->faker->unique()->word,
            'bank_name' => 'Test Bank',
            'is_system_bank' => false,
            'description' => 'Test',
            'status' => 'ACTIVE',
            'is_deleted' => false,
        ]);
    }

    protected function createQuestion(array $overrides = []): Question
    {
        $bank = $this->createQuestionBank($overrides['organization_id'] ?? null);
        $data = array_merge([
            'question_bank_id' => $bank->id,
            'question_code' => $this->faker->unique()->word,
            'question_text' => 'What is 2+2?',
            'question_type' => 'MULTIPLE_CHOICE',
            'difficulty_level' => 'EASY',
            'organization_id' => $bank->organization_id,
            'is_deleted' => false,
        ], $overrides);

        return $this->repository->create($data);
    }

    public function test_crud()
    {
        $bank = $this->createQuestionBank();
        $data = [
            'question_bank_id' => $bank->id,
            'question_code' => 'Q-1001',
            'question_text' => 'What is 2+2?',
            'question_type' => 'MULTIPLE_CHOICE',
            'difficulty_level' => 'EASY',
            'organization_id' => $bank->organization_id,
            'is_deleted' => false,
        ];

        $question = $this->repository->create($data);
        $this->assertInstanceOf(Question::class, $question);
        $this->assertEquals('What is 2+2?', $question->question_text);

        $found = $this->repository->findById($question->id);
        $this->assertEquals($question->id, $found->id);

        $this->repository->update($question->id, ['question_text' => 'What is 3+3?']);
        $updated = $this->repository->findById($question->id);
        $this->assertEquals('What is 3+3?', $updated->question_text);

        $this->repository->delete($question->id);
        $deleted = $this->repository->findById($question->id);
        $this->assertNull($deleted);
    }

    public function test_search()
    {
        $this->createQuestion(['organization_id' => 1, 'difficulty_level' => 'HARD']);
        $this->createQuestion(['organization_id' => 1, 'difficulty_level' => 'EASY']);

        $results = $this->repository->search(['difficulty_level' => 'HARD']);
        $this->assertCount(1, $results);
        $this->assertEquals('HARD', $results->first()->difficulty_level);
    }

    public function test_pagination()
    {
        for ($i = 0; $i < 20; $i++) {
            $this->createQuestion(['organization_id' => 1]);
        }

        $paginator = $this->repository->paginate(10);
        $this->assertCount(10, $paginator->items());
        $this->assertEquals(20, $paginator->total());
    }

    public function test_tenant_isolation()
    {
        $this->createQuestion(['organization_id' => 1]);
        $this->createQuestion(['organization_id' => 2]);

        $results = $this->repository->searchByOrganization(1, []);
        $this->assertCount(1, $results);
        $this->assertEquals(1, $results->first()->organization_id);
    }

    public function test_soft_deletes()
    {
        $question = $this->createQuestion(['is_deleted' => false]);
        
        $deleted = $this->repository->delete($question->id);
        $this->assertTrue($deleted, "Delete failed");
        
        $trashed = $this->repository->findWithTrashed($question->id);
        $this->assertNotNull($trashed, "findWithTrashed returned null");
        $this->assertTrue((bool)$trashed->is_deleted);
        
        $onlyTrashed = $this->repository->findOnlyTrashed();
        $this->assertCount(1, $onlyTrashed);
        $this->assertEquals($question->id, $onlyTrashed->first()->id);
    }
}
