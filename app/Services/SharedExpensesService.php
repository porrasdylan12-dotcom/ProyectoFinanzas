<?php

namespace App\Services;

use App\Models\SharedExpenses;

class SharedExpensesService
{
    /**
     * Create a new shared expense.
     */
    public function create(array $data): SharedExpenses
    {
        return SharedExpenses::create($data);
    }

    /**
     * Update a shared expense.
     */
    public function update(SharedExpenses $sharedExpense, array $data): SharedExpenses
    {
        $sharedExpense->update($data);

        return $sharedExpense;
    }
}
