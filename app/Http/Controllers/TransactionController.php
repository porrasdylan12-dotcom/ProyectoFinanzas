<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Account;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TransactionController extends Controller
{
    public function __construct(public TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->all();
        $filters['user_id'] = $request->user()->id;

        return TransactionResource::collection($this->transactionService->list($filters));
    }

    public function store(TransactionRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $transaction = $this->transactionService->create($data);

        return (new TransactionResource($transaction))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('api.transactions.show', $transaction));
    }

    public function forAccount(Request $request, Account $account): AnonymousResourceCollection
    {
        $this->transactionService->findAccountForUser($account->id, $request->user()->id);

        $filters = $request->all();
        $filters['user_id'] = $request->user()->id;
        $filters['account_id'] = $account->id;

        return TransactionResource::collection($this->transactionService->list($filters));
    }

    public function storeInAccount(TransactionRequest $request, Account $account): JsonResponse
    {
        $this->transactionService->findAccountForUser($account->id, $request->user()->id);

        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['account_id'] = $account->id;

        $transaction = $this->transactionService->create($data);

        return (new TransactionResource($transaction))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('api.transactions.show', $transaction));
    }

    public function show(Request $request, Transaction $transaction): TransactionResource
    {
        $transaction = $this->transactionService->findForUser($transaction->id, $request->user()->id);

        return new TransactionResource($transaction);
    }

    public function update(TransactionRequest $request, Transaction $transaction): TransactionResource
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $transaction = $this->transactionService->update($transaction, $data);

        return new TransactionResource($transaction);
    }

    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        $transaction = $this->transactionService->findForUser($transaction->id, $request->user()->id);
        $this->transactionService->delete($transaction);

        return response()->json(null, 204);
    }
}
