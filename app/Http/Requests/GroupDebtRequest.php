<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GroupDebtRequest extends FormRequest
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
            'shared_expense_id' => ['required', 'integer', 'exists:shared_expenses,id'],
            'creditor_id' => ['required', 'integer', 'exists:users,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'max:50'],
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
            'shared_expense_id.required' => 'El gasto compartido es obligatorio.',
            'shared_expense_id.exists' => 'El gasto compartido seleccionado no es válido.',
            'creditor_id.required' => 'El usuario acreedor es obligatorio.',
            'creditor_id.exists' => 'El usuario acreedor seleccionado no es válido.',
            'total_amount.required' => 'El monto total de la deuda es obligatorio.',
            'total_amount.numeric' => 'El monto total de la deuda debe ser un número válido.',
            'total_amount.min' => 'El monto total de la deuda no puede ser menor a 0.',
        ];
    }
}
