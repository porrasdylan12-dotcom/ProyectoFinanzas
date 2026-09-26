<?php

namespace App\Policies;

use App\Models\Budget;
use App\Models\User;

class BudgetPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->canView($user);
    }

    public function view(User $user, Budget $budget): bool
    {
        return $this->canView($user) && $this->owns($user, $budget->user_id);
    }

    public function create(User $user): bool
    {
        return $this->canWrite($user);
    }

    public function update(User $user, Budget $budget): bool
    {
        return $this->canWrite($user) && $this->owns($user, $budget->user_id);
    }

    public function delete(User $user, Budget $budget): bool
    {
        return $this->canWrite($user) && $this->owns($user, $budget->user_id);
    }
}
