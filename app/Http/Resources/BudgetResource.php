<?php

namespace App\Http\Resources;

use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Budget */
class BudgetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'categoria_id' => $this->category_id,
            'nombre' => $this->name,
            'monto_maximo' => $this->maxAmount,
            'mes' => $this->month,
            'año' => $this->year,
            'creada' => $this->created_at,
            'actualizada' => $this->updated_at,
        ];
    }
}
