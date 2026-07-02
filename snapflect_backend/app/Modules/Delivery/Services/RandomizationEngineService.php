<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Delivery\Exceptions\RandomizationException;

class RandomizationEngineService
{
    public function __construct(
        private readonly SeedGenerationService $seedService,
        private readonly QuestionRandomizationService $questionService,
        private readonly OptionRandomizationService $optionService
    ) {
    }

    /**
     * Executes randomization in-memory against the snapshot payload.
     * Returns an array containing the seed and randomized JSON orders.
     */
    public function execute(AssessmentSnapshot $snapshot, Assessment $assessment, string $sessionUuid, string $candidateUuid): array
    {
        $payload = json_decode($snapshot->snapshot_json, true);
        if (!$payload || !isset($payload['blueprint']['sections'])) {
            throw new RandomizationException(RandomizationException::SNAPSHOT_INVALID, "Snapshot JSON is invalid or missing blueprint structure.");
        }

        // Generate Deterministic Seed
        $seed = $this->seedService->generate($assessment->uuid, $candidateUuid, $sessionUuid);

        // Check assessment configuration for randomization
        // Assuming assessment has these booleans, or we default to true if they don't exist yet.
        $randomizeQuestions = $assessment->randomize_questions ?? true;
        $randomizeOptions = $assessment->randomize_options ?? true;

        $sections = $payload['blueprint']['sections'];
        $questionOrderJson = null;
        $optionOrderJson = null;

        if ($randomizeQuestions) {
            $sections = $this->questionService->randomize($sections, $seed);
            $questionOrderJson = json_encode($sections);
        } else {
            $questionOrderJson = json_encode($sections);
        }

        if ($randomizeOptions) {
            $sections = $this->optionService->randomize($sections, $seed);
            $optionOrderJson = json_encode($sections);
        } else {
            // Keep original order if not option randomized, but still we need to capture the current structure
            $optionOrderJson = json_encode($sections);
        }

        return [
            'seed' => $seed,
            'question_order_json' => $questionOrderJson,
            'option_order_json' => $optionOrderJson,
            'question_randomized' => $randomizeQuestions,
            'option_randomized' => $randomizeOptions,
        ];
    }
}
