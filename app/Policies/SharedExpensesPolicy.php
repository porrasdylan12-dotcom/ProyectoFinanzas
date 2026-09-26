<?php

namespace App\Policies;

use App\Models\SharedExpenses;
use App\Models\User;

class SharedExpensesPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->canView($user);
    }

    public function view(User $user, SharedExpenses $sharedExpense): bool
    {
        return $this->canView($user) && $this->hasAccess($user, $sharedExpense);
    }

    public function create(User $user): bool
    {
        return $this->canWrite($user);
    }

    public function update(User $user, SharedExpenses $sharedExpense): bool
    {
        return $this->canWrite($user) && $this->hasAccess($user, $sharedExpense);
    }

    public function delete(User $user, SharedExpenses $sharedExpense): bool
    {
        return $this->canWrite($user) && $this->hasAccess($user, $sharedExpense);
    }

    /**
     * Un gasto compartido es accesible por quien lo pagó y por los
     * miembros del grupo al que pertenece.
     */
    protected function hasAccess(User $user, SharedExpenses $sharedExpense): bool
    {
        if ($this->owns($user, $sharedExpense->user_id)) {
            return true;
        }

        return $sharedExpense->group !== null
            && $sharedExpense->group->users()->where('users.id', $user->id)->exists();
    }
}
