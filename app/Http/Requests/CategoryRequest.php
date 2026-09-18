<?php

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
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
        $category = $this->route('category');
        $categoryId = $category instanceof Category ? $category->id : null;

        return [
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('categories', 'name')
                    ->where('user_id', $this->user()?->id)
                    ->ignore($categoryId),
            ],
            'type' => ['required', 'string', Rule::in(['ingreso', 'gasto'])],
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
            'name.required' => 'El nombre de la categoría es obligatorio.',
            'name.string' => 'El nombre de la categoría debe ser un texto válido.',
            'name.max' => 'El nombre de la categoría no puede superar los 50 caracteres.',
            'name.unique' => 'Ya existe una categoría con este nombre para el usuario.',

            'type.required' => 'El tipo de categoría es obligatorio.',
            'type.string' => 'El tipo de categoría debe ser un texto válido.',
            'type.in' => 'El tipo de categoría debe ser "ingreso" o "gasto".',
        ];
    }
}
