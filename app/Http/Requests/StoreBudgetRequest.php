<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['sometimes', 'integer', 'exists:users,id'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'min:3', 'max:100'],
            'maxAmount' => ['required', 'numeric', 'min:0.01', 'max:999999999999.99'],
            'month' => ['required', 'integer', 'between:1,12'],
            'year' => ['required', 'integer', 'between:2020,2100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category_id.required' => 'La categoría es obligatoria.',
            'category_id.integer' => 'El identificador de la categoría debe ser un número entero.',
            'category_id.exists' => 'La categoría seleccionada no existe en el sistema.',

            'name.required' => 'El nombre del presupuesto es obligatorio.',
            'name.string' => 'El nombre del presupuesto debe ser un texto válido.',
            'name.min' => 'El nombre del presupuesto debe tener al menos 3 caracteres.',
            'name.max' => 'El nombre del presupuesto no puede superar los 100 caracteres.',

            'maxAmount.required' => 'El monto máximo del presupuesto es obligatorio.',
            'maxAmount.numeric' => 'El monto máximo debe ser un número válido.',
            'maxAmount.min' => 'El monto máximo debe ser al menos 0.01.',
            'maxAmount.max' => 'El monto máximo no puede superar los 999,999,999,999.99.',

            'month.required' => 'El mes es obligatorio.',
            'month.integer' => 'El mes debe ser un número entero.',
            'month.between' => 'El mes debe estar entre 1 y 12.',

            'year.required' => 'El año es obligatorio.',
            'year.integer' => 'El año debe ser un número entero.',
            'year.between' => 'El año debe estar entre 2020 y 2100.',
        ];
    }
}
