<?php

namespace App\Http\Resources;

use App\Models\GroupDebt;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin GroupDebt */
class GroupDebtResource extends JsonResource
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
            'gasto_compartido_id' => $this->shared_expense_id,
            'deudor_id' => $this->debtor_id,
            'acreedor_id' => $this->creditor_id,
            'monto_total' => $this->total_amount,
            'estado' => $this->status,
            'creada' => $this->created_at,
            'actualizada' => $this->updated_at,
        ];
    }
}
