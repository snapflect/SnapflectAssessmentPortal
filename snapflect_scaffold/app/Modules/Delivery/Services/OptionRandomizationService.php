<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

class OptionRandomizationService
{
    /**
     * Sorts options deterministically using a SHA-256 hash per option.
     */
    public function randomize(array $sections, string $seed): array
    {
        $randomizedSections = [];

        foreach ($sections as $section) {
            $questions = $section['questions'] ?? [];
            $randomizedQuestions = [];

            foreach ($questions as $question) {
                $options = $question['options'] ?? [];
                
                // Apply deterministic sort
                usort($options, function ($a, $b) use ($seed, $question) {
                    $hashA = hash('sha256', $seed . $question['uuid'] . $a['uuid']);
                    $hashB = hash('sha256', $seed . $question['uuid'] . $b['uuid']);
                    return strcmp($hashA, $hashB);
                });

                // Maintain exact structure
                $question['options'] = $options;
                $randomizedQuestions[] = $question;
            }

            $section['questions'] = $randomizedQuestions;
            $randomizedSections[] = $section;
        }

        return $randomizedSections;
    }
}
