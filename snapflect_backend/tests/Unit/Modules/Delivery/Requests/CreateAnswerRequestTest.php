<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Requests;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Delivery\Requests\CreateAnswerRequest;
use App\Modules\Delivery\DTOs\CreateAnswerDto;

class CreateAnswerRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_validates_uuid_rules(): void
    {
        $request = new CreateAnswerRequest();
        $rules = $request->rules();

        $this->assertContains('uuid', $rules['attempt_uuid']);
        $this->assertContains('uuid', $rules['attempt_question_uuid']);
        $this->assertContains('uuid', $rules['selected_option_uuid']);
    }

    public function test_validates_answer_type_enum(): void
    {
        $request = new CreateAnswerRequest();
        $rules = $request->rules();

        $this->assertContains('in:SINGLE_CHOICE,MULTIPLE_CHOICE,TRUE_FALSE,SHORT_TEXT,LONG_TEXT,ESSAY,NUMERIC,MCQ,MRQ', $rules['answer_type']);
    }

    public function test_toDto_mapping(): void
    {
        $request = new CreateAnswerRequest();
        $request->merge([
            'attempt_uuid' => '123e4567-e89b-12d3-a456-426614174000',
            'attempt_question_uuid' => '123e4567-e89b-12d3-a456-426614174001',
            'answer_type' => 'SINGLE_CHOICE',
            'selected_option_uuid' => '123e4567-e89b-12d3-a456-426614174002',
            'selected_option_uuids_json' => null,
            'text_answer' => null,
            'numeric_answer' => null,
            'answer_json' => null,
        ]);
        
        $request->setValidator(
            \Illuminate\Support\Facades\Validator::make($request->all(), $request->rules())
        );

        $dto = $request->toDto();

        $this->assertInstanceOf(CreateAnswerDto::class, $dto);
        $this->assertEquals('123e4567-e89b-12d3-a456-426614174000', $dto->attempt_uuid);
        $this->assertEquals('123e4567-e89b-12d3-a456-426614174001', $dto->question_uuid);
        $this->assertEquals('SINGLE_CHOICE', $dto->answer_type);
        $this->assertEquals('123e4567-e89b-12d3-a456-426614174002', $dto->selected_option_uuid);
    }
}
