<?php

namespace App\Http\Controllers;

use App\Http\Requests\GroupDebtRequest;
use App\Http\Resources\GroupDebtResource;
use App\Models\GroupDebt;
use App\Models\SharedExpenses;
use App\Services\GroupDebtService;
use App\Services\SharedExpensesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GroupDebtController extends Controller
{
    public function __construct(
        public GroupDebtService $groupDebtService,
        public SharedExpensesService $sharedExpensesService,
    ) {
        $this->groupDebtService = $groupDebtService;
        $this->sharedExpensesService = $sharedExpensesService;
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->all();
        $filters['user_id'] = $request->user()->id;

        return GroupDebtResource::collection($this->groupDebtService->list($filters));
    }

    public function store(GroupDebtRequest $request): JsonResponse
    {
        $groupDebt = $this->groupDebtService->create($request->validated());

        return (new GroupDebtResource($groupDebt))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('api.group-debts.show', $groupDebt));
    }

    public function forSharedExpense(Request $request, SharedExpenses $sharedExpense): AnonymousResourceCollection
    {
        $this->sharedExpensesService->findForUser($sharedExpense->id, $request->user()->id);

        $filters = $request->all();
        $filters['user_id'] = $request->user()->id;
        $filters['shared_expense_id'] = $sharedExpense->id;

        return GroupDebtResource::collection($this->groupDebtService->list($filters));
    }

    public function storeInSharedExpense(GroupDebtRequest $request, SharedExpenses $sharedExpense): JsonResponse
    {
        $this->sharedExpensesService->findForUser($sharedExpense->id, $request->user()->id);

        $data = $request->validated();
        $data['shared_expense_id'] = $sharedExpense->id;

        $groupDebt = $this->groupDebtService->create($data);

        return (new GroupDebtResource($groupDebt))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('api.group-debts.show', $groupDebt));
    }

    public function show(Request $request, GroupDebt $groupDebt): GroupDebtResource
    {
        $groupDebt = $this->groupDebtService->findForUser($groupDebt->id, $request->user()->id);

        return new GroupDebtResource($groupDebt);
    }

    public function update(GroupDebtRequest $request, GroupDebt $groupDebt): GroupDebtResource
    {
        $groupDebt = $this->groupDebtService->update($groupDebt, $request->validated());

        return new GroupDebtResource($groupDebt);
    }

    public function destroy(Request $request, GroupDebt $groupDebt): JsonResponse
    {
        $groupDebt = $this->groupDebtService->findForUser($groupDebt->id, $request->user()->id);
        $this->groupDebtService->delete($groupDebt);

        return response()->json(null, 204);
    }
}
