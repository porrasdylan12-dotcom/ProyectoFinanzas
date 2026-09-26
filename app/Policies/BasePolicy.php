<?php

namespace App\Policies;

use App\Models\User;
use App\Policies\Concerns\InteractsWithRoles;

abstract class BasePolicy
{
    use InteractsWithRoles;

    /**
     * El administrador del sistema tiene acceso total a cualquier recurso,
     * sin importar quien lo posea. Devolver null delega el resto de decisiones
     * en los metodos de habilidad.
     */
    public function before(User $user, string $ability): ?bool
    {
        return $user->hasRole('admin') ? true : null;
    }
}
