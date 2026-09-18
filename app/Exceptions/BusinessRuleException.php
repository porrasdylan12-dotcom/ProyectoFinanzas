<?php

namespace App\Exceptions;

use RuntimeException;

class BusinessRuleException extends RuntimeException
{
    protected string $businessCode;

    protected int $statusCode;

    public function __construct(
        string $message,
        string $businessCode,
        int $statusCode = 422,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, 0, $previous);

        $this->businessCode = $businessCode;
        $this->statusCode = $statusCode;
    }

    public function getBusinessCode(): string
    {
        return $this->businessCode;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
}
