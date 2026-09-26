<?php

namespace App\Policies;

use App\Models\GroupDebt;
use App\Models\User;

class GroupDebtPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->canView($user);
    }

    public function view(User $user, GroupDebt $groupDebt): bool
    {
        return $this->canView($user) && $this->isParty($user, $groupDebt);
    }

    public function create(User $user): bool
    {
        return $this->canWrite($user);
    }

    public function update(User $user, GroupDebt $groupDebt): bool
    {
        return $this->canWrite($user) && $this->isParty($user, $groupDebt);
    }

    public function delete(User $user, GroupDebt $groupDebt): bool
    {
        return $this->canWrite($user) && $this->isParty($user, $groupDebt);
    }

    /**
     * Una deuda es del deudor y del acreedor.
     */
    protected function isParty(User $user, GroupDebt $groupDebt): bool
    {
        return $this->owns($user, $groupDebt->debtor_id)
            || $this->owns($user, $groupDebt->creditor_id);
    }
}
