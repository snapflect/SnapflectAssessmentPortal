<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Exceptions;

use Exception;

class SessionLaunchException extends Exception
{
    public const ASSESSMENT_NOT_PUBLISHED = 'ASSESSMENT_NOT_PUBLISHED';
    public const CANDIDATE_REQUIRED = 'CANDIDATE_REQUIRED';
    public const SESSION_NOT_FOUND = 'SESSION_NOT_FOUND';
    public const SESSION_ALREADY_LAUNCHED = 'SESSION_ALREADY_LAUNCHED';
    public const SESSION_CANCELLED = 'SESSION_CANCELLED';
    public const SNAPSHOT_GENERATION_FAILED = 'SNAPSHOT_GENERATION_FAILED';
    public const ATTEMPT_CREATION_FAILED = 'ATTEMPT_CREATION_FAILED';
    public const INVALID_SESSION_STATE = 'INVALID_SESSION_STATE';

    protected string $errorCode;

    public function __construct(string $errorCode, string $message = "")
    {
        $this->errorCode = $errorCode;
        parent::__construct($message ?: "Session Launch exception: {$errorCode}");
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }
}
