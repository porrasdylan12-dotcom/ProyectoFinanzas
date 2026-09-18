<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Models\Budget;
use App\Services\BudgetService;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function __construct(private BudgetService $budgetService) {}

    public function index(Request $request)
    {
        $budgets = $this->budgetService->list($request->all());

        return view('budgets.index', compact('budgets'));
    }

    public function create()
    {
        return view('budgets.create');
    }

    public function store(StoreBudgetRequest $request)
    {
        $this->budgetService->create($request->validated());

        return redirect()->route('budgets.index')
            ->with('success', 'Presupuesto creado correctamente.');
    }

    public function show(Budget $budget)
    {
        return view('budgets.show', compact('budget'));
    }

    public function edit(Budget $budget)
    {
        return view('budgets.edit', compact('budget'));
    }

    public function update(UpdateBudgetRequest $request, Budget $budget)
    {
        $this->budgetService->update($budget, $request->validated());

        return redirect()->route('budgets.show', $budget)
            ->with('success', 'Presupuesto actualizado correctamente.');
    }

    public function destroy(Budget $budget)
    {
        $this->budgetService->delete($budget);

        return redirect()->route('budgets.index')
            ->with('success', 'Presupuesto eliminado correctamente.');
    }
}
