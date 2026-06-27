<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Helpers;

use App\Modules\Delivery\Helpers\SnapshotLabelMapper;
use PHPUnit\Framework\TestCase;

class SnapshotLabelMapperTest extends TestCase
{
    private function makeSnapshotJson(array $override = []): string
    {
        $payload = array_merge([
            'blueprint' => [
                'sections' => [
                    [
                        'uuid'      => 'sec-uuid-1',
                        'section_name' => 'Section One',
                        'questions' => [
                            [
                                'uuid'          => 'q-uuid-1',
                                'question_text' => 'What is the capital of France?',
                                'question_type' => 'single_choice',
                                'options'       => [
                                    ['uuid' => 'opt-uuid-1', 'option_text' => 'Paris'],
                                    ['uuid' => 'opt-uuid-2', 'option_text' => 'London'],
                                ],
                            ],
                            [
                                'uuid'          => 'q-uuid-2',
                                'question_text' => 'Select all programming languages.',
                                'question_type' => 'multiple_choice',
                                'options'       => [
                                    ['uuid' => 'opt-uuid-3', 'option_text' => 'PHP'],
                                    ['uuid' => 'opt-uuid-4', 'option_text' => 'TypeScript'],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ], $override);

        return json_encode($payload);
    }

    public function test_maps_question_text_correctly(): void
    {
        $result = SnapshotLabelMapper::fromJson($this->makeSnapshotJson());

        $this->assertArrayHasKey('q-uuid-1', $result['questions']);
        $this->assertSame('What is the capital of France?', $result['questions']['q-uuid-1']['text']);
    }

    public function test_maps_question_type_correctly(): void
    {
        $result = SnapshotLabelMapper::fromJson($this->makeSnapshotJson());

        $this->assertSame('single_choice',   $result['questions']['q-uuid-1']['type']);
        $this->assertSame('multiple_choice', $result['questions']['q-uuid-2']['type']);
    }

    public function test_maps_section_uuid_on_each_question(): void
    {
        $result = SnapshotLabelMapper::fromJson($this->makeSnapshotJson());

        $this->assertSame('sec-uuid-1', $result['questions']['q-uuid-1']['sectionUuid']);
        $this->assertSame('sec-uuid-1', $result['questions']['q-uuid-2']['sectionUuid']);
    }

    public function test_maps_option_labels_correctly(): void
    {
        $result = SnapshotLabelMapper::fromJson($this->makeSnapshotJson());

        $this->assertSame('Paris',      $result['options']['opt-uuid-1']);
        $this->assertSame('London',     $result['options']['opt-uuid-2']);
        $this->assertSame('PHP',        $result['options']['opt-uuid-3']);
        $this->assertSame('TypeScript', $result['options']['opt-uuid-4']);
    }

    public function test_returns_empty_maps_for_invalid_json(): void
    {
        $result = SnapshotLabelMapper::fromJson('not-valid-json');

        $this->assertSame([], $result['questions']);
        $this->assertSame([], $result['options']);
    }

    public function test_returns_empty_maps_when_blueprint_missing(): void
    {
        $result = SnapshotLabelMapper::fromJson(json_encode(['assessment_uuid' => 'abc']));

        $this->assertSame([], $result['questions']);
        $this->assertSame([], $result['options']);
    }

    public function test_skips_questions_without_uuid(): void
    {
        $json = json_encode([
            'blueprint' => [
                'sections' => [[
                    'uuid'      => 'sec-1',
                    'questions' => [
                        ['question_text' => 'No UUID here', 'question_type' => 'single_choice', 'options' => []],
                        ['uuid' => 'q-good', 'question_text' => 'Has UUID', 'question_type' => 'single_choice', 'options' => []],
                    ],
                ]],
            ],
        ]);

        $result = SnapshotLabelMapper::fromJson($json);

        $this->assertCount(1, $result['questions']);
        $this->assertArrayHasKey('q-good', $result['questions']);
    }

    public function test_handles_questions_with_no_options_gracefully(): void
    {
        $json = json_encode([
            'blueprint' => [
                'sections' => [[
                    'uuid'      => 'sec-1',
                    'questions' => [
                        ['uuid' => 'q-1', 'question_text' => 'Open-ended', 'question_type' => 'text', 'options' => []],
                    ],
                ]],
            ],
        ]);

        $result = SnapshotLabelMapper::fromJson($json);

        $this->assertSame('Open-ended', $result['questions']['q-1']['text']);
        $this->assertSame([], $result['options']);
    }
}
