<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
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

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
