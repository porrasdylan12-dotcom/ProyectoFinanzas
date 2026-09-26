<?php

namespace App\Policies;

/**
 * Capa 1 (rol): hereda de BasePolicy las habilidades viewAny/view/create/update/delete.
 *
 * Capa 2 (parte de la deuda): GroupDebtService::findForUser() acepta a la persona
 * usuaria cuando es deudora o acreedora y responde 404 en caso contrario.
 */
class GroupDebtPolicy extends BasePolicy {}
