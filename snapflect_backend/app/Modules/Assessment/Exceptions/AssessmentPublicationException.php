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
    protected array $errors;

    public function __construct(string $errorCode, string $message = "", array $errors = [])
    {
        $this->errorCode = $errorCode;
        $this->errors = $errors;
        parent::__construct($message ?: "Publication exception: {$errorCode}");
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function render($request)
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'error_code' => $this->errorCode,
            'validation_errors' => $this->errors
        ], 422);
    }
}
