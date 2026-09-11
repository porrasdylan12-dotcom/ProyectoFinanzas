<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

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
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:50'],
            'balance' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre de la cuenta es obligatorio.',
            'type.required' => 'El tipo de cuenta es obligatorio.',
            'balance.required' => 'El saldo inicial es obligatorio.',
            'balance.numeric' => 'El saldo inicial debe ser un número válido.',
            'balance.min' => 'El saldo inicial no puede ser menor a 0.',
        ];
    }
}
