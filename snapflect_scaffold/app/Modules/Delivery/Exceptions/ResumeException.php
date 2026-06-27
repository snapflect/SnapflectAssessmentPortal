<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Exceptions;

use Exception;

class ResumeException extends Exception
{
    public const ATTEMPT_NOT_FOUND = 'ATTEMPT_NOT_FOUND';
    public const INVALID_RESUME_STATE = 'INVALID_RESUME_STATE';
    public const ATTEMPT_EXPIRED = 'ATTEMPT_EXPIRED';
    public const ATTEMPT_SUBMITTED = 'ATTEMPT_SUBMITTED';
    public const SNAPSHOT_NOT_FOUND = 'SNAPSHOT_NOT_FOUND';
    public const RANDOMIZATION_DATA_MISSING = 'RANDOMIZATION_DATA_MISSING';
    public const RANDOMIZATION_DATA_CORRUPTED = 'RANDOMIZATION_DATA_CORRUPTED';
    public const DRAFT_DATA_CORRUPTED = 'DRAFT_DATA_CORRUPTED';
    public const RESUME_NOT_ALLOWED = 'RESUME_NOT_ALLOWED';

    protected string $errorCode;

    public function __construct(string $errorCode, string $message = "")
    {
        $this->errorCode = $errorCode;
        parent::__construct($message ?: "Resume exception: {$errorCode}");
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public static function attemptNotFound(): self
    {
        return new self(self::ATTEMPT_NOT_FOUND, "Attempt not found or access denied.");
    }

    public static function invalidState(string $state): self
    {
        return new self(self::INVALID_RESUME_STATE, "Cannot resume attempt in state: {$state}.");
    }

    public static function expired(): self
    {
        return new self(self::ATTEMPT_EXPIRED, "The attempt has expired and cannot be resumed.");
    }

    public static function snapshotNotFound(): self
    {
        return new self(self::SNAPSHOT_NOT_FOUND, "Required snapshot data is missing or incomplete.");
    }

    public static function randomizationMissing(): self
    {
        return new self(self::RANDOMIZATION_DATA_MISSING, "Attempt has not been randomized. Cannot resume.");
    }

    public static function randomizationCorrupted(string $reason): self
    {
        return new self(self::RANDOMIZATION_DATA_CORRUPTED, "Randomization integrity failed: {$reason}");
    }

    public static function draftCorrupted(string $reason): self
    {
        return new self(self::DRAFT_DATA_CORRUPTED, "Draft integrity failed: {$reason}");
    }
}
