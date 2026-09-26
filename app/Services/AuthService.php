<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Registra un nuevo usuario y genera un token de acceso.
     *
     * @param  array<string, mixed>  $data
     * @return array{user: User, token: string}
     */
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        $token = $user->createToken(
            name: 'user_token',
            expiresAt: now()->addMinutes(30)
        );

        return [
            'user' => $user,
            'token' => $token->plainTextToken,
        ];
    }

    /**
     * Autentica al usuario y genera un token de acceso.
     *
     * @return array{user: User, token: string}
     */
    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw new BusinessRuleException(
                'Las credenciales proporcionadas son incorrectas.',
                'CREDENCIALES_INVALIDAS',
                401
            );
        }

        $token = $user->createToken(
            name: 'user_token',
            expiresAt: now()->addMinutes(30)
        );

        return [
            'user' => $user,
            'token' => $token->plainTextToken,
        ];
    }

    /**
     * Cierra la sesión revocando el token actual del usuario.
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
