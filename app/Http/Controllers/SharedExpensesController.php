<?php

namespace App\Http\Controllers;

use App\Models\SharedExpenses;
use Illuminate\Http\Request;

class SharedExpensesController extends Controller
{
	public function index()
	{
		$sharedExpenses = SharedExpenses::latest()->paginate(15);

		return view('shared_expenses.index', compact('sharedExpenses'));
	}

	public function create()
	{
		return view('shared_expenses.create');
	}

	public function store(Request $request)
	{
		$data = $request->validate([
			// Add the model's required fields here.
		]);

		$sharedExpense = SharedExpenses::create($data);

		return redirect()
			->route('shared-expenses.show', $sharedExpense)
			->with('success', 'Shared expense created successfully.');
	}

	public function show(SharedExpenses $sharedExpense)
	{
		return view('shared_expenses.show', compact('sharedExpense'));
	}

	public function edit(SharedExpenses $sharedExpense)
	{
		return view('shared_expenses.edit', compact('sharedExpense'));
	}

	public function update(Request $request, SharedExpenses $sharedExpense)
	{
		$data = $request->validate([
			// Add the model's required fields here.
		]);

		$sharedExpense->update($data);

		return redirect()
			->route('shared-expenses.show', $sharedExpense)
			->with('success', 'Shared expense updated successfully.');
	}

	public function destroy(SharedExpenses $sharedExpense)
	{
		$sharedExpense->delete();

		return redirect()
			->route('shared-expenses.index')
			->with('success', 'Shared expense deleted successfully.');
	}
}
