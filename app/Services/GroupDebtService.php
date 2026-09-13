<?php

namespace App\Services;

use App\Models\GroupDebt;

class GroupDebtService
{
    /**
     * Create a new group debt.
     */
    public function create(array $data): GroupDebt
    {
        return GroupDebt::create($data);
    }

    /**
     * Update a group debt.
     */
    public function update(GroupDebt $groupDebt, array $data): GroupDebt
    {
        $groupDebt->update($data);

        return $groupDebt;
    }
}
