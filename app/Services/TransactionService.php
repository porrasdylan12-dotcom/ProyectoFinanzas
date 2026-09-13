<?php

namespace App\Services;

use App\Models\Transaction;

class TransactionService
{
    /**
     * Create a new transaction.
     */
    public function create(array $data): Transaction
    {
        return Transaction::create($data);
    }

    /**
     * Update a transaction.
     */
    public function update(Transaction $transaction, array $data): Transaction
    {
        $transaction->update($data);

        return $transaction;
    }
}
