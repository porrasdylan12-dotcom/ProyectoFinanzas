<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAccountRequest;
use App\Models\Account;
use App\Services\AccountService;
use Illuminate\Http\Request;

class AccountController extends Controller
{

public function __construct(public AccountService $accountService)
    {
        $this->accountService = $accountService;
    }
    public function index()
    {
        $accounts = Account::all();

        return view('accounts.index', compact('accounts'));
    }

    public function create()
    {
        return view('accounts.create');
    }

    public function store(StoreAccountRequest $request)
    {
        $validatedData = $request->validated();

        $account = $this->accountService->crear($validatedData);

        return $account;
    }

    public function show(Account $account)
    {
        return view('accounts.show', compact('account'));
    }

    public function edit(Account $account)
    {
        return view('accounts.edit', compact('account'));
    }

    public function update(Request $request, Account $account)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:50'],
            'balance' => ['required', 'numeric', 'min:0'],
        ]);

        $account->update($data);

        return redirect()->route('accounts.index')->with('success', 'Cuenta actualizada correctamente.');
    }

    public function destroy(Account $account)
    {
        $account->delete();

        return redirect()->route('accounts.index')->with('success', 'Cuenta eliminada correctamente.');
    }
}
