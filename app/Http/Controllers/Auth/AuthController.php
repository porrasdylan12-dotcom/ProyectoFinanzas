<?php

namespace App\Http\Controllers\Auth;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
   
    public function register(RegisterRequest $request): JsonResponse
    {

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
        ]);

        $token = $user->createToken(
            'auth_token', 
            ['*'], 
            now()->addMinutes(120)
        )->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado exitosamente',
            'data' => [
                'user' => clone $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $throttleKey = strtolower($request->email) . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'message' => "Demasiados intentos de inicio de sesión. Por favor, intente de nuevo en {$seconds} segundos."
            ], 429); 
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);

            return response()->json([
                'message' => 'Las credenciales proporcionadas son incorrectas.'
            ], 401); 
        }

        RateLimiter::clear($throttleKey);

        $token = $user->createToken(
            'auth_token', 
            ['*'], 
            now()->addMinutes(120)
        )->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'data' => [
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }
}