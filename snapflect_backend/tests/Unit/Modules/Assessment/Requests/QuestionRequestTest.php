<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Requests;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Assessment\Requests\CreateQuestionRequest;

class QuestionRequestTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup mock data, factories, and user roles
    }

    public function test_question_option_validation()
    {
        $request = new CreateQuestionRequest();
        $rules = $request->rules();

        $this->assertArrayHasKey('options', $rules);
        $this->assertArrayHasKey('options.*.option_text', $rules);
        $this->assertArrayHasKey('options.*.is_correct', $rules);
        $this->assertContains('required', $rules['options']);
        $this->assertContains('required', $rules['options.*.option_text']);
    }

    public function test_required_fields()
    {
        $request = new CreateQuestionRequest();
        $rules = $request->rules();

        $this->assertContains('required', $rules['question_bank_uuid']);
        $this->assertContains('required', $rules['question_code']);
        $this->assertContains('required', $rules['question_type']);
        $this->assertContains('required', $rules['question_text']);
        $this->assertContains('required', $rules['max_score']);
    }
}
