<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Helpers;

class SnapshotLabelMapper
{
    /**
     * Parse the snapshot JSON and return a flat label map suitable for API responses.
     *
     * Output shape:
     * [
     *   'questions' => [
     *     'q-uuid' => [
     *       'text'        => 'Question body text',
     *       'type'        => 'single_choice',
     *       'sectionUuid' => 'sec-uuid',
     *     ],
     *   ],
     *   'options' => [
     *     'opt-uuid' => 'Option label text',
     *   ],
     * ]
     */
    public static function fromJson(string $snapshotJson): array
    {
        $payload = json_decode($snapshotJson, true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($payload)) {
            return ['questions' => [], 'options' => []];
        }

        $questions = [];
        $options   = [];

        foreach ($payload['blueprint']['sections'] ?? [] as $section) {
            $sectionUuid = $section['uuid'] ?? null;

            foreach ($section['questions'] ?? [] as $question) {
                $qUuid = $question['uuid'] ?? null;
                if (!$qUuid) {
                    continue;
                }

                $questions[$qUuid] = [
                    'text'        => $question['question_text'] ?? '',
                    'type'        => $question['question_type'] ?? 'single_choice',
                    'sectionUuid' => $sectionUuid,
                ];

                foreach ($question['options'] ?? [] as $option) {
                    $optUuid = $option['uuid'] ?? null;
                    if ($optUuid) {
                        $options[$optUuid] = $option['option_text'] ?? '';
                    }
                }
            }
        }

        return ['questions' => $questions, 'options' => $options];
    }
}
