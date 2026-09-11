<?php

namespace App\Services;

use App\Models\Budget;

class BudgetService
{
    /**
     * Calculates the remaining amount for a budget.
     */
    public function create(array $data)
    {

        return Budget::create($data);
    }
}
