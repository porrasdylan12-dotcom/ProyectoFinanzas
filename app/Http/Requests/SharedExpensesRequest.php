<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SharedExpensesRequest extends FormRequest
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
            'group_id' => ['required', 'integer', 'exists:groups,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'date' => ['required', 'date'],
            'participants' => ['nullable', 'array'],
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
            'group_id.required' => 'El grupo es obligatorio.',
            'group_id.exists' => 'El grupo seleccionado no es válido.',
            'amount.required' => 'El monto del gasto compartido es obligatorio.',
            'amount.numeric' => 'El monto debe ser un número válido.',
            'amount.min' => 'El monto no puede ser menor a 0.',
            'date.required' => 'La fecha del gasto compartido es obligatoria.',
            'date.date' => 'La fecha debe ser una fecha válida.',
        ];
    }
}
