<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
	public function index()
	{
		return response()->json(Transaction::latest()->get());
	}

	public function store(Request $request)
	{
		$data = $request->validate([
			'type' => ['required', 'string', 'max:50'],
			'amount' => ['required', 'numeric', 'min:0'],
			'description' => ['nullable', 'string'],
			'transaction_date' => ['required', 'date'],
		]);

		$transaction = Transaction::create($data);

		return response()->json($transaction, 201);
	}

	public function show(Transaction $transaction)
	{
		return response()->json($transaction);
	}

	public function update(Request $request, Transaction $transaction)
	{
		$data = $request->validate([
			'type' => ['sometimes', 'string', 'max:50'],
			'amount' => ['sometimes', 'numeric', 'min:0'],
			'description' => ['nullable', 'string'],
			'transaction_date' => ['sometimes', 'date'],
		]);

		$transaction->update($data);

		return response()->json($transaction);
	}

	public function destroy(Transaction $transaction)
	{
		$transaction->delete();

		return response()->noContent();
	}
}
