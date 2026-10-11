<?php

namespace App\Policies;

/**
 * Capa 1 (rol): hereda de BasePolicy las habilidades viewAny/view/create/update/delete.
 *
 * Capa 2 (acceso al gasto): SharedExpensesService::findForUser() acepta a quien pagó
 * el gasto o a los miembros de su grupo, y responde 404 en caso contrario.
 */
class SharedExpensesPolicy extends BasePolicy {}
