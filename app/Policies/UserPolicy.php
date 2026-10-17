<?php

namespace App\Policies;

use App\Models\User;

/**
 * No hay service que aplique una segunda capa para las personas usuarias, asi que
 * esta policy conserva la comprobacion de propiedad: una persona solo puede
 * consultarse o editarse a si misma, y el administrador del sistema accede a
 * cualquiera. La capa de rol la detiene antes el middleware role:admin de
 * /api/admin, de modo que ambas capas son necesarias.
 */
class UserPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function view(User $user, ?User $model = null): bool
    {
        return $user->hasRole('admin') || $user->is($model);
    }

    public function update(User $user, ?User $model = null): bool
    {
        return $user->hasRole('admin') || $user->is($model);
    }

    public function delete(User $user, ?User $model = null): bool
    {
        return $user->hasRole('admin') || $user->is($model);
    }
}
