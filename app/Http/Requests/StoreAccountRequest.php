<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAccountRequest extends FormRequest
{
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->user()?->id ?? $this->input('user_id');

        return [
            'user_id' => ['sometimes', 'integer', 'exists:users,id'],
            'name' => [
                'required',
                'string',
                'min:3',
                'max:50',
                Rule::unique('accounts', 'name')->where('user_id', $userId),
            ],
            'type' => ['required', 'string', Rule::in(['ahorros', 'corriente', 'efectivo'])],
            'balance' => ['required', 'numeric', 'min:0', 'max:999999999999.99'],
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
            'name.required' => 'El nombre de la cuenta es obligatorio.',
            'name.string' => 'El nombre de la cuenta debe ser un texto válido.',
            'name.min' => 'El nombre de la cuenta debe tener al menos 3 caracteres.',
            'name.max' => 'El nombre de la cuenta no puede superar los 50 caracteres.',
            'name.unique' => 'Ya existe una cuenta con este nombre para el usuario seleccionado.',

            'type.required' => 'El tipo de cuenta es obligatorio.',
            'type.string' => 'El tipo de cuenta debe ser un texto válido.',
            'type.in' => 'El tipo de cuenta debe ser uno de: ahorros, corriente o efectivo.',

            'balance.required' => 'El saldo inicial es obligatorio.',
            'balance.numeric' => 'El saldo inicial debe ser un número válido.',
            'balance.min' => 'El saldo inicial no puede ser menor a 0.',
            'balance.max' => 'El saldo inicial no puede superar los 999,999,999,999.99.',
        ];
    }
}
