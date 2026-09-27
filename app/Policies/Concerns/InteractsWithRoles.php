<?php

namespace App\Policies\Concerns;

use App\Models\User;

/**
 * Capa 1 de autorizacion: decide unicamente si el ROL de la persona usuaria
 * habilita la habilidad.
 *
 * La pertenencia del recurso (ownership) no se comprueba aqui a proposito. Si la
 * policy la comprobara responderia 403, mientras que un identificador inexistente
 * falla antes, en el route model binding, con 404: esa diferencia confirmaria que
 * el identificador existe. La propiedad se verifica en la capa 2, dentro de los
 * servicios, con findForUser(), que devuelve 404 tanto si el recurso no existe
 * como si pertenece a otra persona.
 */
trait InteractsWithRoles
{
    /**
     * @return list<string>
     */
    protected function rolesAllowedToRead(): array
    {
        return ['admin', 'user', 'viewer'];
    }

    /**
     * @return list<string>
     */
    protected function rolesAllowedToWrite(): array
    {
        return ['admin', 'user'];
    }

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole($this->rolesAllowedToRead());
    }

    public function view(User $user): bool
    {
        return $user->hasAnyRole($this->rolesAllowedToRead());
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole($this->rolesAllowedToWrite());
    }

    public function update(User $user): bool
    {
        return $user->hasAnyRole($this->rolesAllowedToWrite());
    }

    public function delete(User $user): bool
    {
        return $user->hasAnyRole($this->rolesAllowedToWrite());
    }
}
