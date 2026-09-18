<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\SharedExpenses */
class SharedExpensesResource extends JsonResource
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
            'grupo_id' => $this->group_id,
            'usuario_id' => $this->user_id,
            'monto' => $this->amount,
            'descripcion' => $this->description,
            'fecha' => $this->date,
            'participantes' => $this->participants,
            'deudas' => GroupDebtResource::collection(
                $this->whenLoaded('debts')
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
