<?php

namespace App\Exceptions;

use RuntimeException;

class BusinessRuleException extends RuntimeException
{
    protected string $businessCode;

    protected int $statusCode;

    protected array $extraData;

    public function __construct(
        string $message,
        string $businessCode,
        int $statusCode = 422,
        array $extraData = [],
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, 0, $previous);

        $this->businessCode = $businessCode;
        $this->statusCode = $statusCode;
        $this->extraData = $extraData;
    }

    public function getBusinessCode(): string
    {
        return $this->businessCode;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getExtraData(): array
    {
        return $this->extraData;
    }
}
