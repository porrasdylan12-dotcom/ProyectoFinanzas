<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use App\Services\BudgetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BudgetController extends Controller
{
    public function __construct(public BudgetService $budgetService)
    {
        $this->budgetService = $budgetService;
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->all();
        $filters['user_id'] = $request->user()->id;

        return BudgetResource::collection($this->budgetService->list($filters));
    }

    public function store(StoreBudgetRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $budget = $this->budgetService->create($data);

        return (new BudgetResource($budget))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('api.budgets.show', $budget));
    }

    public function show(Request $request, Budget $budget): BudgetResource
    {
        $budget = $this->budgetService->findForUser($budget->id, $request->user()->id);

        return new BudgetResource($budget);
    }

    public function update(UpdateBudgetRequest $request, Budget $budget): BudgetResource
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $budget = $this->budgetService->update($budget, $data);

        return new BudgetResource($budget);
    }

    public function destroy(Request $request, Budget $budget): JsonResponse
    {
        $budget = $this->budgetService->findForUser($budget->id, $request->user()->id);
        $this->budgetService->delete($budget);

        return response()->json(null, 204);
    }
}
