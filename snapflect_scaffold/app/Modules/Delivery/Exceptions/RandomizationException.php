<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Exceptions;

use Exception;

class RandomizationException extends Exception
{
    public const ALREADY_RANDOMIZED = 'ALREADY_RANDOMIZED';
    public const SNAPSHOT_INVALID = 'SNAPSHOT_INVALID';

    protected string $errorCode;

    public function __construct(string $errorCode, string $message = "")
    {
        $this->errorCode = $errorCode;
        parent::__construct($message ?: "Randomization exception: {$errorCode}");
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public static function alreadyRandomized(): self
    {
        return new self(self::ALREADY_RANDOMIZED, "Attempt ordering is already randomized and frozen. Recalculation is strictly prohibited.");
    }
}
