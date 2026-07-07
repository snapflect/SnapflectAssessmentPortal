<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Requests;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Delivery\Requests\SubmitAssessmentRequest;
use App\Modules\Delivery\DTOs\SubmitAttemptDto;

class SubmitAssessmentRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_validates_uuid_rules(): void
    {
        $request = new SubmitAssessmentRequest();
        $rules = $request->rules();

        $this->assertContains('uuid', $rules['attempt_uuid']);
    }

    public function test_requires_confirmation_boolean(): void
    {
        $request = new SubmitAssessmentRequest();
        $rules = $request->rules();

        $this->assertContains('required', $rules['confirmation']);
        $this->assertContains('boolean', $rules['confirmation']);
    }

    public function test_toDto_mapping(): void
    {
        $request = new SubmitAssessmentRequest();
        $request->merge([
            'attempt_uuid' => '123e4567-e89b-12d3-a456-426614174000',
            'confirmation' => true,
        ]);
        
        $request->setValidator(
            \Illuminate\Support\Facades\Validator::make($request->all(), $request->rules())
        );

        $dto = $request->toDto();

        $this->assertInstanceOf(SubmitAttemptDto::class, $dto);
        $this->assertEquals('123e4567-e89b-12d3-a456-426614174000', $dto->attemptUuid);
    }
}
