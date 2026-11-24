<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    private const MAX_PAGE_SIZE = 50;

    private const SORTABLE_FIELDS = ['transaction_date', 'amount', 'created_at'];

    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, Transaction>
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Transaction::query()->with(['account', 'category']);

        if (! empty($filters['user_id'])) {
            $query->whereHas('account', function (Builder $q) use ($filters) {
                $q->where('user_id', $filters['user_id']);
            });
        }

        if (! empty($filters['account_id'])) {
            $query->where('account_id', $filters['account_id']);
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['type'])) {
            $query->where('transactions.type', $filters['type']);
        }

        if (! empty($filters['from'])) {
            $query->where('transaction_date', '>=', $filters['from']);
        }

        if (! empty($filters['to'])) {
            $query->where('transaction_date', '<=', $filters['to']);
        }

        if (! empty($filters['description'])) {
            $query->where('description', 'like', '%'.$filters['description'].'%');
        }

        $sortBy = $filters['sort_by'] ?? 'transaction_date';
        $sortDir = $filters['sort_dir'] ?? 'asc';

        if (! in_array($sortBy, self::SORTABLE_FIELDS)) {
            $sortBy = 'transaction_date';
        }

        $sortDir = strtolower($sortDir) === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortBy, $sortDir);

        $secondSort = $sortBy === 'transaction_date' ? 'created_at' : 'transaction_date';
        $query->orderBy($secondSort, 'asc');

        $perPage = min((int) ($filters['per_page'] ?? 15), self::MAX_PAGE_SIZE);

        return $query->paginate($perPage);
    }

    public function findForUser(int $id, int $userId): Transaction
    {
        return Transaction::where('id', $id)
            ->whereHas('account', function (Builder $q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->firstOrFail();
    }

    public function findAccountForUser(int $accountId, int $userId): Account
    {
        return Account::where('id', $accountId)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Transaction
    {
        $this->assertRelationsBelongToUser($data);

        return DB::transaction(function () use ($data) {
            $transaction = Transaction::create($data);

            $this->adjustBalance(
                (int) $transaction->account_id,
                $transaction->type === 'ingreso' ? (float) $transaction->amount : -(float) $transaction->amount
            );

            return $transaction;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Transaction $transaction, array $data): Transaction
    {
        $this->assertRelationsBelongToUser(array_merge(
            ['user_id' => $transaction->account->user_id],
            $data
        ));

        $previousAccountId = (int) $transaction->account_id;
        $previousDelta = $transaction->type === 'ingreso'
            ? (float) $transaction->amount
            : -(float) $transaction->amount;

        return DB::transaction(function () use ($transaction, $data, $previousAccountId, $previousDelta) {
            $transaction->update($data);

            $this->adjustBalance($previousAccountId, -$previousDelta);

            $newDelta = $transaction->type === 'ingreso'
                ? (float) $transaction->amount
                : -(float) $transaction->amount;
            $this->adjustBalance((int) $transaction->account_id, $newDelta);

            return $transaction;
        });
    }

    /**
     * Capa 2 de autorizacion: resuelve la transacción exigiendo que la cuenta que
     * la respalda pertenezca a la persona usuaria antes de modificarla.
     * findForUser() responde 404, de modo que una transacción inexistente y una
     * ajena resultan indistinguibles.
     *
     * Esta resolucion es obligatoria y no un adorno: update() no conoce a quien
     * llama, y assertRelationsBelongToUser() valida las cuentas y categorías que
     * llegan en el payload, no la procedencia de la transacción. Sin este filtro,
     * un cuerpo con account_id y category_id propios desplazaría una transacción
     * ajena a la cuenta de quien la llama.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateForUser(int $id, int $userId, array $data): Transaction
    {
        return $this->update($this->findForUser($id, $userId), $data);
    }

    public function delete(Transaction $transaction): bool
    {
        $delta = $transaction->type === 'ingreso'
            ? (float) $transaction->amount
            : -(float) $transaction->amount;

        return DB::transaction(function () use ($transaction, $delta) {
            $result = $transaction->delete();

            $this->adjustBalance((int) $transaction->account_id, -$delta);

            return $result;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function assertRelationsBelongToUser(array $data): void
    {
        $userId = (int) ($data['user_id'] ?? 0);
        $accountId = (int) ($data['account_id'] ?? 0);
        $categoryId = (int) ($data['category_id'] ?? 0);

        Account::where('id', $accountId)->where('user_id', $userId)->firstOrFail();
        Category::where('id', $categoryId)->where('user_id', $userId)->firstOrFail();
    }

    private function adjustBalance(int $accountId, float $delta): void
    {
        Account::where('id', $accountId)->increment('balance', $delta);
    }
}
