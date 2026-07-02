<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Exceptions;

use Exception;

class AutoSaveException extends Exception
{
    public const ATTEMPT_EXPIRED = 'ATTEMPT_EXPIRED';
    public const ATTEMPT_SUBMITTED = 'ATTEMPT_SUBMITTED';
    public const INVALID_ATTEMPT_STATE = 'INVALID_ATTEMPT_STATE';
    public const STALE_DRAFT_VERSION = 'STALE_DRAFT_VERSION';
    public const QUESTION_NOT_FOUND = 'QUESTION_NOT_FOUND';
    public const ATTEMPT_NOT_FOUND = 'ATTEMPT_NOT_FOUND';
    public const SAVE_FAILED = 'SAVE_FAILED';

    protected string $errorCode;

    public function __construct(string $errorCode, string $message = "")
    {
        $this->errorCode = $errorCode;
        parent::__construct($message ?: "AutoSave exception: {$errorCode}");
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public static function questionNotFound(): self
    {
        return new self(self::QUESTION_NOT_FOUND, "The requested question does not exist in the attempt snapshot.");
    }

    public static function staleDraftVersion(): self
    {
        return new self(self::STALE_DRAFT_VERSION, "The provided draft version is stale. A newer save has already been persisted.");
    }
}
