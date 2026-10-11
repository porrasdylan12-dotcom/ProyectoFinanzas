<?php

namespace App\Policies;

/**
 * Capa 1 (rol): hereda de BasePolicy las habilidades viewAny/view/create/update/delete.
 *
 * Capa 2 (propiedad): BudgetService::findForUser() exige que el presupuesto
 * pertenezca a la persona usuaria y responde 404 en caso contrario.
 */
class BudgetPolicy extends BasePolicy {}
