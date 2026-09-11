<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class BudgetController extends Controller
{
	public function index()
	{
		return view('budgets.index');
	}

	public function create()
	{
		return view('budgets.create');
	}

	public function store(Request $request)
	{
		$validated = $request->validate([
			'name' => ['required', 'string', 'max:255'],
			'amount' => ['required', 'numeric', 'min:0'],
		]);

		// Persist the validated budget data here.
		return redirect()->route('budgets.index');
	}
}
