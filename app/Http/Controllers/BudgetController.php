<?php

namespace App\Http\Controllers;

use App\Http\Requests\BudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use App\Services\BudgetService;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
	public function __construct(public BudgetService $budgetService)
    {
        $this->budgetService = $budgetService;
    }
	public function index()
	{
		return view('budgets.index');
	}


	public function store(BudgetRequest $request)
    {
        $validatedData = $request->validated();

        $account = $this->budgetService->create($validatedData);
    
        return $account;
	}

    public function show(Budget $budget)
    {
        return new BudgetResource($budget);
    }

    
}
