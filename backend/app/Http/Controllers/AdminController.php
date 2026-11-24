<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Attributes\Controllers\Authorize;
use Spatie\Permission\Models\Role;

class AdminController extends Controller
{
    #[Authorize('viewAny', User::class)]
    public function users(Request $request): AnonymousResourceCollection
    {
        $users = User::query()
            ->with('roles')
            ->orderBy('id')
            ->paginate(min((int) $request->integer('per_page', 50), 50));

        return UserResource::collection($users);
    }

    #[Authorize('viewAny', User::class)]
    public function roles(): JsonResponse
    {
        $roles = Role::query()
            ->with('permissions')
            ->orderBy('id')
            ->get()
            ->map(fn (Role $role): array => [
                'id' => $role->id,
                'nombre' => $role->name,
                'permisos' => $role->permissions->pluck('name')->all(),
            ]);

        return response()->json(['data' => $roles]);
    }
}
