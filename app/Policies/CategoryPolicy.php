<?php

namespace App\Policies;

/**
 * Capa 1 (rol): hereda de BasePolicy las habilidades viewAny/view/create/update/delete.
 *
 * Capa 2 (propiedad): CategoryService::findForUser() exige que la categoría
 * pertenezca a la persona usuaria y responde 404 en caso contrario.
 */
class CategoryPolicy extends BasePolicy {}
