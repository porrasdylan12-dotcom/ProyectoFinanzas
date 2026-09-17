<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Http\Requests\LoginRequest;

class LoginController extends Controller
{
    public function __invoke(LoginRequest $request): JsonResponse
    {
        $usuario = User::where('email', $request->email)->first();

        // Mensaje idéntico exista o no la cuenta
        if (! $usuario || ! Hash::check($request->password, $usuario->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $token = $usuario->createToken(
            name: 'user_token',
            expiresAt: now()->addMinutes(30)
        );

        return response()->json(['token' => $token->plainTextToken], 200);
    }
}
