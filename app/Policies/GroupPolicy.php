<?php

namespace App\Policies;

use App\Models\Group;
use App\Models\User;

class GroupPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->canView($user);
    }

    public function view(User $user, Group $group): bool
    {
        return $this->canView($user) && $this->isMember($user, $group);
    }

    public function create(User $user): bool
    {
        return $this->canWrite($user);
    }

    public function update(User $user, Group $group): bool
    {
        return $this->canWrite($user) && $this->isGroupAdmin($user, $group);
    }

    public function delete(User $user, Group $group): bool
    {
        return $this->canWrite($user) && $this->isGroupAdmin($user, $group);
    }

    public function isMember(User $user, Group $group): bool
    {
        return $group->users()->where('users.id', $user->id)->exists();
    }

    /**
     * El rol del pivote user_group distingue al administrador del grupo
     * del resto de sus miembros.
     */
    public function isGroupAdmin(User $user, Group $group): bool
    {
        return $group->users()
            ->where('users.id', $user->id)
            ->wherePivot('role', 'admin')
            ->exists();
    }
}
