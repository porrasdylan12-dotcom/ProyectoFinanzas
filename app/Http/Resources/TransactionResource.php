<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Transaction */
class TransactionResource extends JsonResource
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
            'cuenta_id' => $this->account_id,
            'categoria_id' => $this->category_id,
            'tipo' => $this->type,
            'monto' => (float) $this->amount,
            'descripcion' => $this->description,
            'fecha' => $this->transaction_date,
            'creada' => $this->created_at,
            'actualizada' => $this->updated_at,
        ];
    }
}
