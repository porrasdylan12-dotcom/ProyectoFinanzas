<?php

namespace App\Http\Controllers;

use App\Exceptions\BusinessRuleException;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Http\Requests\LoginRequest;

class LoginController extends Controller
{
    public function __invoke(LoginRequest $request): JsonResponse
    {
        $usuario = User::where('email', $request->email)->first();

        // Mensaje idéntico exista o no la cuenta
        if (! $usuario || ! Hash::check($request->password, $usuario->password)) {
            throw new BusinessRuleException(
                'Las credenciales proporcionadas son incorrectas.',
                'CREDENCIALES_INVALIDAS',
                401
            );
        }

        $token = $usuario->createToken(
            name: 'user_token',
            expiresAt: now()->addMinutes(30)
            
        );

        return response()->json(['token' => $token->plainTextToken], 200);
    }
}
