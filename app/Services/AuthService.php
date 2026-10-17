<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class AuthService
{
    private const MAX_LOGIN_ATTEMPTS = 5;

    private const DECAY_SECONDS = 60;

    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        $user->assignRole(Role::findOrCreate('user', 'web'));

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
        $throttleKey = $this->throttleKey($email);

        $this->ensureIsNotRateLimited($throttleKey);

        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);

            throw new BusinessRuleException(
                'Las credenciales proporcionadas son incorrectas.',
                'CREDENCIALES_INVALIDAS',
                401
            );
        }

        RateLimiter::clear($throttleKey);

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

    /**
     * Envía el enlace de restablecimiento sin revelar si el correo existe.
     */
    public function sendPasswordResetLink(string $email): void
    {
        Password::broker()->sendResetLink(['email' => $email]);
    }

    private function throttleKey(string $email): string
    {
        return Str::transliterate(Str::lower($email).'|'.request()->ip());
    }

    private function ensureIsNotRateLimited(string $key): void
    {
        if (! RateLimiter::tooManyAttempts($key, self::MAX_LOGIN_ATTEMPTS)) {
            return;
        }

        $seconds = RateLimiter::availableIn($key);

        throw new BusinessRuleException(
            "Demasiados intentos de inicio de sesión. Intente de nuevo en {$seconds} segundos.",
            'DEMASIADOS_INTENTOS',
            429,
            ['retry_after' => $seconds]
        );
    }
}
