<?php

namespace App\Http\Controllers;

use App\Http\Requests\SharedExpensesRequest;
use App\Models\SharedExpenses;
use App\Services\SharedExpensesService;

class SharedExpensesController extends Controller
{
    public function __construct(public SharedExpensesService $sharedExpensesService)
    {
        $this->sharedExpensesService = $sharedExpensesService;
    }

    public function index()
    {
        $sharedExpenses = SharedExpenses::latest()->paginate(15);

        return view('shared_expenses.index', compact('sharedExpenses'));
    }

    public function create()
    {
        return view('shared_expenses.create');
    }

    public function store(SharedExpensesRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $sharedExpense = $this->sharedExpensesService->create($data);

        return redirect()
            ->route('shared-expenses.show', $sharedExpense)
            ->with('success', 'Gasto compartido creado correctamente.');
    }

    public function show(SharedExpenses $sharedExpense)
    {
        return view('shared_expenses.show', compact('sharedExpense'));
    }

    public function edit(SharedExpenses $sharedExpense)
    {
        return view('shared_expenses.edit', compact('sharedExpense'));
    }

    public function update(SharedExpensesRequest $request, SharedExpenses $sharedExpense)
    {
        $this->sharedExpensesService->update($sharedExpense, $request->validated());

        return redirect()
            ->route('shared-expenses.show', $sharedExpense)
            ->with('success', 'Gasto compartido actualizado correctamente.');
    }

    public function destroy(SharedExpenses $sharedExpense)
    {
        $sharedExpense->delete();

        return redirect()
            ->route('shared-expenses.index')
            ->with('success', 'Gasto compartido eliminado correctamente.');
    }
}