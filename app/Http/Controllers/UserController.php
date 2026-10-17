<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(public UserService $userService)
    {
        $this->userService = $userService;
    }

    public function show(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function update(UpdateProfileRequest $request): UserResource
    {
        $user = $this->userService->updateProfile(
            $request->user(),
            $request->validated('name'),
            $request->validated('email'),
        );

        return new UserResource($user);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $this->userService->updatePassword(
            $request->user(),
            $request->validated('current_password'),
            $request->validated('password'),
        );

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.',
        ]);
    }
}
