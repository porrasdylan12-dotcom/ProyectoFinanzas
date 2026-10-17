<?php

namespace App\Http\Requests;

use App\Concerns\PasswordValidationRules;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePasswordRequest extends FormRequest
{
    use PasswordValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'password' => $this->passwordRules(),
        ];
    }

    /**
     * Mensajes de validación en español, asociados a cada campo.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'current_password.required' => 'Escribe tu contraseña actual.',
            'current_password.string' => 'La contraseña actual debe ser un texto válido.',

            'password.required' => 'La nueva contraseña es obligatoria.',
            'password.string' => 'La nueva contraseña debe ser un texto válido.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'password.min' => 'La contraseña no cumple los requisitos mínimos.',
        ];
    }
}
