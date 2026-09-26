<?php

namespace App\Policies;

use App\Models\Account;
use App\Models\User;

class AccountPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->canView($user);
    }

    public function view(User $user, Account $account): bool
    {
        return $this->canView($user) && $this->owns($user, $account->user_id);
    }

    public function create(User $user): bool
    {
        return $this->canWrite($user);
    }

    public function update(User $user, Account $account): bool
    {
        return $this->canWrite($user) && $this->owns($user, $account->user_id);
    }

    public function delete(User $user, Account $account): bool
    {
        return $this->canWrite($user) && $this->owns($user, $account->user_id);
    }
}
