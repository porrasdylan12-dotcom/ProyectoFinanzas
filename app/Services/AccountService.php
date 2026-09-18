<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Account;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AccountService
{
    private const MAX_PAGE_SIZE = 50;

    private const SORTABLE_FIELDS = ['name', 'balance', 'type', 'created_at'];

    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Account::query();

        if (! empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (! empty($filters['name'])) {
            $query->where('name', 'like', '%'.$filters['name'].'%');
        }

        $sortBy = $filters['sort_by'] ?? 'name';
        $sortDir = $filters['sort_dir'] ?? 'asc';

        if (! in_array($sortBy, self::SORTABLE_FIELDS)) {
            $sortBy = 'name';
        }

        $sortDir = strtolower($sortDir) === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortBy, $sortDir);

        $secondSort = $sortBy === 'name' ? 'balance' : 'name';
        $query->orderBy($secondSort, 'asc');

        $perPage = min((int) ($filters['per_page'] ?? 15), self::MAX_PAGE_SIZE);

        return $query->paginate($perPage);
    }

    public function findForUser(int $id, int $userId): Account
    {
        return Account::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    public function create(array $data): Account
    {
        $this->validateNoDuplicateCashAccount($data);

        return Account::create($data);
    }

    public function update(Account $account, array $data): Account
    {
        unset($data['user_id']);

        $account->update($data);

        return $account;
    }

    public function delete(Account $account): bool
    {
        return DB::transaction(function () use ($account) {
            if ($account->transactions()->exists()) {
                throw new BusinessRuleException(
                    'No se puede eliminar la cuenta porque tiene transacciones asociadas.',
                    'CUENTA_CON_DEPENDENCIAS',
                    409
                );
            }

            return $account->delete();
        });
    }

    private function validateNoDuplicateCashAccount(array $data): void
    {
        if (
            ($data['type'] ?? '') === 'efectivo'
            && ($data['balance'] ?? 0) > 0
        ) {
            $exists = Account::where('user_id', $data['user_id'])
                ->where('type', 'efectivo')
                ->exists();

            if ($exists) {
                throw new BusinessRuleException(
                    'El usuario ya tiene una cuenta de efectivo. No se puede crear otra con saldo mayor a 0.',
                    'CUENTA_EFECTIVO_DUPLICADA',
                    409
                );
            }
        }
    }
}
