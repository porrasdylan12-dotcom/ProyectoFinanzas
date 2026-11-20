<?php

namespace App\Exceptions;

use RuntimeException;

class BusinessRuleException extends RuntimeException
{
    protected string $businessCode;

    protected int $statusCode;

    /** @var array<string, mixed> */
    protected array $extraData;

    /**
     * @param  array<string, mixed>  $extraData
     */
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

    /**
     * @return array<string, mixed>
     */
    public function getExtraData(): array
    {
        return $this->extraData;
    }
}
