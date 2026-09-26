<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Account */
class AccountResource extends JsonResource
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
            'nombre' => $this->name,
            'saldo' => $this->balance,
            'tipo' => $this->type,
            'creada' => $this->created_at,
            'actualizada' => $this->updated_at,
        ];
    }
}
