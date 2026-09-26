<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->isAdmin($user);
    }

    public function view(User $user, User $model): bool
    {
        return $this->isAdmin($user) || $user->is($model);
    }

    public function update(User $user, User $model): bool
    {
        return $this->isAdmin($user) || $user->is($model);
    }

    public function delete(User $user, User $model): bool
    {
        return $this->isAdmin($user) || $user->is($model);
    }
}
