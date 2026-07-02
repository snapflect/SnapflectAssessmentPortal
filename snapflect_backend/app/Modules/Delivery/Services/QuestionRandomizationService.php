<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

class QuestionRandomizationService
{
    /**
     * Sorts questions deterministically using a SHA-256 hash.
     * Original Section structure is maintained.
     */
    public function randomize(array $sections, string $seed): array
    {
        $randomizedSections = [];

        foreach ($sections as $section) {
            $questions = $section['questions'] ?? [];
            
            // Apply deterministic sort
            usort($questions, function ($a, $b) use ($seed) {
                $hashA = hash('sha256', $seed . $a['uuid']);
                $hashB = hash('sha256', $seed . $b['uuid']);
                return strcmp($hashA, $hashB);
            });

            // Maintain exact structure
            $section['questions'] = $questions;
            $randomizedSections[] = $section;
        }

        return $randomizedSections;
    }
}
