<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Exceptions;

use Exception;

class SubmissionException extends Exception
{
    public const ATTEMPT_NOT_FOUND = 'ATTEMPT_NOT_FOUND';
    public const INVALID_SUBMISSION_STATE = 'INVALID_SUBMISSION_STATE';
    public const ATTEMPT_ALREADY_SUBMITTED = 'ATTEMPT_ALREADY_SUBMITTED';
    public const ATTEMPT_CANCELLED = 'ATTEMPT_CANCELLED';
    public const SNAPSHOT_NOT_FOUND = 'SNAPSHOT_NOT_FOUND';
    public const RANDOMIZATION_DATA_CORRUPTED = 'RANDOMIZATION_DATA_CORRUPTED';
    public const DRAFT_DATA_CORRUPTED = 'DRAFT_DATA_CORRUPTED';
    public const SUBMISSION_NOT_ALLOWED = 'SUBMISSION_NOT_ALLOWED';
    public const ATTEMPT_FINALIZATION_FAILED = 'ATTEMPT_FINALIZATION_FAILED';

    protected string $errorCode;

    public function __construct(string $errorCode, string $message = "")
    {
        $this->errorCode = $errorCode;
        parent::__construct($message ?: "Submission exception: {$errorCode}");
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public static function invalidState(string $state): self
    {
        return new self(self::INVALID_SUBMISSION_STATE, "Cannot submit attempt in state: {$state}.");
    }

    public static function snapshotNotFound(): self
    {
        return new self(self::SNAPSHOT_NOT_FOUND, "Required snapshot data is missing or corrupted.");
    }

    public static function randomizationCorrupted(string $reason): self
    {
        return new self(self::RANDOMIZATION_DATA_CORRUPTED, "Randomization validation failed: {$reason}");
    }

    public static function draftCorrupted(string $reason): self
    {
        return new self(self::DRAFT_DATA_CORRUPTED, "Draft validation failed: {$reason}");
    }

    public static function finalizationFailed(string $reason): self
    {
        return new self(self::ATTEMPT_FINALIZATION_FAILED, "Attempt finalization failed: {$reason}");
    }
}
