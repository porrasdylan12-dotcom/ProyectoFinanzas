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
        $hasGroupInRoute = filled($this->route('group'));

        return [
            'group_id' => $hasGroupInRoute
                ? ['sometimes', 'integer', 'exists:groups,id']
                : ['required', 'integer', 'exists:groups,id'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999999999.99'],
            'description' => ['nullable', 'string', 'max:1000'],
            'date' => ['required', 'date'],
            'participants' => ['required', 'array', 'min:2'],
            'participants.*' => ['integer', 'distinct', 'exists:users,id'],
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
            'group_id.integer' => 'El identificador del grupo debe ser un número entero.',
            'group_id.exists' => 'El grupo seleccionado no es válido.',

            'amount.required' => 'El monto del gasto compartido es obligatorio.',
            'amount.numeric' => 'El monto debe ser un número válido.',
            'amount.min' => 'El monto debe ser al menos 0.01.',
            'amount.max' => 'El monto no puede superar los 999,999,999,999.99.',

            'description.max' => 'La descripción no puede superar los 1000 caracteres.',

            'date.required' => 'La fecha del gasto compartido es obligatoria.',
            'date.date' => 'La fecha debe ser una fecha válida.',

            'participants.required' => 'Debes indicar al menos un participante.',
            'participants.array' => 'Los participantes deben enviarse como una lista.',
            'participants.min' => 'Deben existir al menos 2 participantes.',
            'participants.*.integer' => 'Cada participante debe ser un identificador numérico.',
            'participants.*.distinct' => 'Los participantes no pueden repetirse.',
            'participants.*.exists' => 'Uno de los participantes no existe en el sistema.',
        ];
    }
}
