<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransactionRequest extends FormRequest
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
        $hasAccountInRoute = filled($this->route('account'));

        return [
            'account_id' => $hasAccountInRoute
                ? ['sometimes', 'integer', 'exists:accounts,id']
                : ['required', 'integer', 'exists:accounts,id'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'type' => ['required', 'string', Rule::in(['ingreso', 'gasto'])],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999999999.99'],
            'description' => ['nullable', 'string', 'max:1000'],
            'transaction_date' => ['required', 'date'],
        ];
    }

    /**
     * Get the custom validation messages for the request.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'account_id.required' => 'La cuenta es obligatoria.',
            'account_id.integer' => 'El identificador de la cuenta debe ser un número entero.',
            'account_id.exists' => 'La cuenta seleccionada no es válida.',

            'category_id.required' => 'La categoría es obligatoria.',
            'category_id.integer' => 'El identificador de la categoría debe ser un número entero.',
            'category_id.exists' => 'La categoría seleccionada no es válida.',

            'type.required' => 'El tipo de transacción es obligatorio.',
            'type.in' => 'El tipo de transacción debe ser "ingreso" o "gasto".',

            'amount.required' => 'El monto de la transacción es obligatorio.',
            'amount.numeric' => 'El monto debe ser un número válido.',
            'amount.min' => 'El monto debe ser al menos 0.01.',
            'amount.max' => 'El monto no puede superar los 999,999,999,999.99.',

            'description.max' => 'La descripción no puede superar los 1000 caracteres.',

            'transaction_date.required' => 'La fecha de la transacción es obligatoria.',
            'transaction_date.date' => 'La fecha debe ser una fecha válida.',
        ];
    }
}
