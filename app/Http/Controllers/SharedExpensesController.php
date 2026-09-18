<?php

namespace App\Http\Controllers;

use App\Http\Requests\SharedExpensesRequest;
use App\Http\Resources\SharedExpensesResource;
use App\Models\Group;
use App\Models\SharedExpenses;
use App\Services\GroupService;
use App\Services\SharedExpensesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SharedExpensesController extends Controller
{
    public function __construct(
        public SharedExpensesService $sharedExpensesService,
        public GroupService $groupService,
    ) {
        $this->sharedExpensesService = $sharedExpensesService;
        $this->groupService = $groupService;
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->all();
        $filters['user_id'] = $request->user()->id;

        return SharedExpensesResource::collection($this->sharedExpensesService->list($filters));
    }

    public function store(SharedExpensesRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $sharedExpense = $this->sharedExpensesService->create($data)->load('debts');

        return (new SharedExpensesResource($sharedExpense))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('api.shared-expenses.show', $sharedExpense));
    }

    public function forGroup(Request $request, Group $group): AnonymousResourceCollection
    {
        $this->groupService->findForUser($group->id, $request->user()->id);

        $filters = $request->all();
        $filters['user_id'] = $request->user()->id;
        $filters['group_id'] = $group->id;

        return SharedExpensesResource::collection($this->sharedExpensesService->list($filters));
    }

    public function storeInGroup(SharedExpensesRequest $request, Group $group): JsonResponse
    {
        $this->groupService->findForUser($group->id, $request->user()->id);

        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['group_id'] = $group->id;

        $sharedExpense = $this->sharedExpensesService->create($data)->load('debts');

        return (new SharedExpensesResource($sharedExpense))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('api.shared-expenses.show', $sharedExpense));
    }

    public function show(Request $request, SharedExpenses $sharedExpense): SharedExpensesResource
    {
        $sharedExpense = $this->sharedExpensesService
            ->findForUser($sharedExpense->id, $request->user()->id)
            ->load('debts');

        return new SharedExpensesResource($sharedExpense);
    }

    public function update(SharedExpensesRequest $request, SharedExpenses $sharedExpense): SharedExpensesResource
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $sharedExpense = $this->sharedExpensesService->update($sharedExpense, $data);

        return new SharedExpensesResource($sharedExpense);
    }

    public function destroy(Request $request, SharedExpenses $sharedExpense): JsonResponse
    {
        $sharedExpense = $this->sharedExpensesService
            ->findForUser($sharedExpense->id, $request->user()->id);
        $this->sharedExpensesService->delete($sharedExpense);

        return response()->json(null, 204);
    }
}
