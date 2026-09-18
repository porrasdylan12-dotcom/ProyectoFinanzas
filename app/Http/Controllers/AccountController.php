<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAccountRequest;
use App\Http\Requests\UpdateAccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use App\Services\AccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AccountController extends Controller
{
    public function __construct(public AccountService $accountService)
    {
        $this->accountService = $accountService;
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->all();
        $filters['user_id'] = $request->user()->id;

        return AccountResource::collection($this->accountService->list($filters));
    }

    public function store(StoreAccountRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $account = $this->accountService->create($data);

        return (new AccountResource($account))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('api.accounts.show', $account));
    }

    public function show(Request $request, Account $account): AccountResource
    {
        $account = $this->accountService->findForUser($account->id, $request->user()->id);

        return new AccountResource($account);
    }

    public function update(UpdateAccountRequest $request, Account $account): AccountResource
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $account = $this->accountService->findForUser($account->id, $request->user()->id);
        $account = $this->accountService->update($account, $data);

        return new AccountResource($account);
    }

    public function destroy(Request $request, Account $account): JsonResponse
    {
        $account = $this->accountService->findForUser($account->id, $request->user()->id);
        $this->accountService->delete($account);

        return response()->json(null, 204);
    }
}
