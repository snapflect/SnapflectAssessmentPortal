<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Exceptions;

use Exception;

class AssessmentPublicationException extends Exception
{
    public const INVALID_TRANSITION = 'INVALID_TRANSITION';
    public const VALIDATION_REQUIRED = 'VALIDATION_REQUIRED';
    public const ASSESSMENT_NOT_READY = 'ASSESSMENT_NOT_READY';
    public const ASSESSMENT_ALREADY_PUBLISHED = 'ASSESSMENT_ALREADY_PUBLISHED';
    public const ASSESSMENT_ALREADY_ARCHIVED = 'ASSESSMENT_ALREADY_ARCHIVED';

    protected string $errorCode;

    public function __construct(string $errorCode, string $message = "")
    {
        $this->errorCode = $errorCode;
        parent::__construct($message ?: "Publication exception: {$errorCode}");
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }
}
