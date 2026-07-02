<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Exceptions;

use Exception;

class TimerExpiredException extends Exception
{
    public const ATTEMPT_EXPIRED = 'ATTEMPT_EXPIRED';
    public const ATTEMPT_NOT_STARTED = 'ATTEMPT_NOT_STARTED';
    public const INVALID_TIMER_STATE = 'INVALID_TIMER_STATE';
    public const TIMER_CONFIGURATION_ERROR = 'TIMER_CONFIGURATION_ERROR';

    protected string $errorCode;

    public function __construct(string $errorCode, string $message = "")
    {
        $this->errorCode = $errorCode;
        parent::__construct($message ?: "Timer exception: {$errorCode}");
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public static function alreadyExpired(): self
    {
        return new self(self::ATTEMPT_EXPIRED, "The attempt has expired and cannot be continued.");
    }
    
    public static function notStarted(): self
    {
        return new self(self::ATTEMPT_NOT_STARTED, "The attempt timer has not been started yet.");
    }
}
