<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransactionRequest;
use App\Models\Transaction;
use App\Services\TransactionService;

class TransactionController extends Controller
{
    public function __construct(public TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function index()
    {
        $transactions = Transaction::latest()->get();

        return view('transactions.index', compact('transactions'));
    }

    public function create()
    {
        return view('transactions.create');
    }

    public function store(TransactionRequest $request)
    {
        $transaction = $this->transactionService->create($request->validated());

        return redirect()
            ->route('transactions.show', $transaction)
            ->with('success', 'Transacción creada correctamente.');
    }

    public function show(Transaction $transaction)
    {
        return view('transactions.show', compact('transaction'));
    }

    public function edit(Transaction $transaction)
    {
        return view('transactions.edit', compact('transaction'));
    }

    public function update(TransactionRequest $request, Transaction $transaction)
    {
        $this->transactionService->update($transaction, $request->validated());

        return redirect()
            ->route('transactions.show', $transaction)
            ->with('success', 'Transacción actualizada correctamente.');
    }

    public function destroy(Transaction $transaction)
    {
        $transaction->delete();

        return redirect()
            ->route('transactions.index')
            ->with('success', 'Transacción eliminada correctamente.');
    }
}