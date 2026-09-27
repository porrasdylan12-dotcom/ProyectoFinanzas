<?php

namespace App\Policies;

/**
 * Capa 1 (rol): hereda de BasePolicy las habilidades viewAny/view/create/update/delete.
 *
 * Capa 2 (propiedad): AccountService::findForUser() exige que la cuenta pertenezca
 * a la persona usuaria y responde 404 en caso contrario.
 */
class AccountPolicy extends BasePolicy {}
