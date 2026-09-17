<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAccountRequest;
use App\Http\Requests\UpdateAccountRequest;
use App\Models\Account;
use App\Services\AccountService;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function __construct(private AccountService $accountService) {}

    public function index(Request $request)
    {
        $accounts = $this->accountService->list($request->all());

        return view('accounts.index', compact('accounts'));
    }

    public function create()
    {
        return view('accounts.create');
    }

    public function store(StoreAccountRequest $request)
    {
        $this->accountService->create($request->validated());

        return redirect()->route('accounts.index')
            ->with('success', 'Cuenta creada correctamente.');
    }

    public function show(Account $account)
    {
        return view('accounts.show', compact('account'));
    }

    public function edit(Account $account)
    {
        return view('accounts.edit', compact('account'));
    }

    public function update(UpdateAccountRequest $request, Account $account)
    {
        $this->accountService->update($account, $request->validated());

        return redirect()->route('accounts.show', $account)
            ->with('success', 'Cuenta actualizada correctamente.');
    }

    public function destroy(Account $account)
    {
        $this->accountService->delete($account);

        return redirect()->route('accounts.index')
            ->with('success', 'Cuenta eliminada correctamente.');
    }
}
