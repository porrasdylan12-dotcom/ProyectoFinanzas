<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        $hasExpenseInRoute = filled($this->route('sharedExpense'));

        return [
            'shared_expense_id' => $hasExpenseInRoute
                ? ['sometimes', 'integer', 'exists:shared_expenses,id']
                : ['required', 'integer', 'exists:shared_expenses,id'],
            'debtor_id' => ['required', 'integer', 'exists:users,id'],
            'creditor_id' => ['required', 'integer', 'exists:users,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'total_amount' => ['required', 'numeric', 'min:0.01', 'max:999999999999.99'],
            'status' => ['sometimes', 'string', Rule::in(['pending', 'paid'])],
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
            'shared_expense_id.integer' => 'El identificador del gasto compartido debe ser un número entero.',
            'shared_expense_id.exists' => 'El gasto compartido seleccionado no es válido.',

            'debtor_id.required' => 'El usuario deudor es obligatorio.',
            'debtor_id.integer' => 'El identificador del deudor debe ser un número entero.',
            'debtor_id.exists' => 'El usuario deudor seleccionado no es válido.',

            'creditor_id.required' => 'El usuario acreedor es obligatorio.',
            'creditor_id.integer' => 'El identificador del acreedor debe ser un número entero.',
            'creditor_id.exists' => 'El usuario acreedor seleccionado no es válido.',

            'total_amount.required' => 'El monto total de la deuda es obligatorio.',
            'total_amount.numeric' => 'El monto total de la deuda debe ser un número válido.',
            'total_amount.min' => 'El monto total de la deuda debe ser al menos 0.01.',
            'total_amount.max' => 'El monto total de la deuda no puede superar los 999,999,999,999.99.',

            'status.string' => 'El estado debe ser un texto válido.',
            'status.in' => 'El estado de la deuda debe ser "pending" o "paid".',
        ];
    }
}
