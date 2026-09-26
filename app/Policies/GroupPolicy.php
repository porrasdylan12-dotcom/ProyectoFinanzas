<?php

namespace App\Policies;

/**
 * Capa 1 (rol): hereda de BasePolicy las habilidades viewAny/view/create/update/delete.
 *
 * Capa 2 (pertenencia al grupo): GroupService::findForUser() exige la membresía y
 * responde 404 en caso contrario. La administración del grupo (rol del pivote
 * user_group) se verifica en GroupService::delete().
 */
class GroupPolicy extends BasePolicy {}
