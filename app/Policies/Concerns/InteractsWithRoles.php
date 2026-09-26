<?php

namespace App\Policies\Concerns;

use App\Models\User;

trait InteractsWithRoles
{
    /**
     * Habilidades que implican modificar datos.
     *
     * @var list<string>
     */
    protected array $writeAbilities = ['create', 'update', 'delete'];

    protected function isAdmin(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * El rol viewer solo puede leer; admin y user pueden escribir.
     */
    protected function canWrite(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'user']);
    }

    protected function canView(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'user', 'viewer']);
    }

    protected function isWriteAbility(string $ability): bool
    {
        return in_array($ability, $this->writeAbilities, true);
    }

    protected function owns(User $user, ?int $ownerId): bool
    {
        return $ownerId !== null && $ownerId === $user->id;
    }
}
