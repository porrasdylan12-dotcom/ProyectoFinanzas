<?php

namespace App\Policies;

use App\Models\User;
use App\Policies\Concerns\InteractsWithRoles;

abstract class BasePolicy
{
    use InteractsWithRoles;

    /**
     * El administrador del sistema tiene acceso total a cualquier recurso,
     * sin importar quién lo posea. Devolver null delega el resto de decisiones
     * en los métodos específicos de cada policy.
     */
    public function before(User $user, string $ability): ?bool
    {
        return $this->isAdmin($user) ? true : null;
    }
}
