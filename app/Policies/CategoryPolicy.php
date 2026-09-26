<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->canView($user);
    }

    public function view(User $user, Category $category): bool
    {
        return $this->canView($user) && $this->owns($user, $category->user_id);
    }

    public function create(User $user): bool
    {
        return $this->canWrite($user);
    }

    public function update(User $user, Category $category): bool
    {
        return $this->canWrite($user) && $this->owns($user, $category->user_id);
    }

    public function delete(User $user, Category $category): bool
    {
        return $this->canWrite($user) && $this->owns($user, $category->user_id);
    }
}
