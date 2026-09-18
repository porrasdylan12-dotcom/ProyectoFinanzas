<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Group */
class GroupResource extends JsonResource
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
            'nombre' => $this->name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'miembros' => $this->whenLoaded('users', fn () => $this->users->map(
                function (User $user): array {
                    $pivot = $user->pivot;

                    return [
                        'id' => $user->id,
                        'nombre' => $user->name,
                        'email' => $user->email,
                        'rol' => $pivot->role,
                        'fecha_ingreso' => $pivot->joined_at,
                    ];
                }
            )),
        ];
    }
}
