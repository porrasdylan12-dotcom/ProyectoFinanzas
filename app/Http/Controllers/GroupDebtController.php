<?php

namespace App\Http\Controllers;

use App\Http\Requests\GroupDebtRequest;
use App\Models\GroupDebt;
use App\Services\GroupDebtService;

class GroupDebtController extends Controller
{
    public function __construct(public GroupDebtService $groupDebtService)
    {
        $this->groupDebtService = $groupDebtService;
    }

    public function index()
    {
        $groupDebts = GroupDebt::all();

        return view('group_debts.index', compact('groupDebts'));
    }

    public function create()
    {
        return view('group_debts.create');
    }

    public function store(GroupDebtRequest $request)
    {
        $data = $request->validated();
        $data['debtor_id'] = $request->user()->id;

        $groupDebt = $this->groupDebtService->create($data);

        return redirect()
            ->route('group-debts.show', $groupDebt)
            ->with('success', 'Deuda creada correctamente.');
    }

    public function show(GroupDebt $groupDebt)
    {
        return view('group_debts.show', compact('groupDebt'));
    }

    public function edit(GroupDebt $groupDebt)
    {
        return view('group_debts.edit', compact('groupDebt'));
    }

    public function update(GroupDebtRequest $request, GroupDebt $groupDebt)
    {
        $this->groupDebtService->update($groupDebt, $request->validated());

        return redirect()
            ->route('group-debts.show', $groupDebt)
            ->with('success', 'Deuda actualizada correctamente.');
    }

    public function destroy(GroupDebt $groupDebt)
    {
        $groupDebt->delete();

        return redirect()
            ->route('group-debts.index')
            ->with('success', 'Deuda eliminada correctamente.');
    }
}