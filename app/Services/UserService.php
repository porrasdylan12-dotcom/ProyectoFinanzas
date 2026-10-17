<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserService
{
    /**
     * Actualiza el nombre y el correo del usuario.
     *
     * Si el correo cambia, se invalida la verificación previa.
     */
    public function updateProfile(User $user, string $name, string $email): User
    {
        $user->fill([
            'name' => $name,
            'email' => $email,
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return $user;
    }

    /**
     * Cambia la contraseña tras verificar la contraseña actual.
     *
     * @throws ValidationException
     */
    public function updatePassword(
        User $user,
        string $currentPassword,
        string $newPassword,
    ): void {
        if (! Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'La contraseña actual no es correcta.',
            ]);
        }

        $user->update([
            'password' => $newPassword,
        ]);
    }
}
