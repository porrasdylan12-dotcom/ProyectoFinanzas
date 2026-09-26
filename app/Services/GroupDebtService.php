<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\GroupDebt;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class GroupDebtService
{
    private const MAX_PAGE_SIZE = 50;

    private const SORTABLE_FIELDS = ['total_amount', 'status', 'created_at'];

    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = GroupDebt::query()->with(['debtor', 'creditor', 'sharedExpense']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['shared_expense_id'])) {
            $query->where('shared_expense_id', $filters['shared_expense_id']);
        }

        if (! empty($filters['user_id'])) {
            $query->where(function (Builder $q) use ($filters) {
                $q->where('debtor_id', $filters['user_id'])
                    ->orWhere('creditor_id', $filters['user_id']);
            });
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';

        if (! in_array($sortBy, self::SORTABLE_FIELDS)) {
            $sortBy = 'created_at';
        }

        $sortDir = strtolower($sortDir) === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) ($filters['per_page'] ?? 15), self::MAX_PAGE_SIZE);

        return $query->paginate($perPage);
    }

    public function findForUser(int $id, int $userId): GroupDebt
    {
        return GroupDebt::where('id', $id)
            ->where(function (Builder $q) use ($userId) {
                $q->where('debtor_id', $userId)
                    ->orWhere('creditor_id', $userId);
            })
            ->firstOrFail();
    }

    public function create(array $data): GroupDebt
    {
        $this->validateNotSelfDebt($data);

        return DB::transaction(function () use ($data) {
            return GroupDebt::create($data);
        });
    }

    public function update(GroupDebt $groupDebt, array $data): GroupDebt
    {
        $this->validateNotSelfDebt($data);
        $this->validateStatusTransition($groupDebt, $data);

        $groupDebt->update($data);

        return $groupDebt;
    }

    /**
     * Capa 2 de autorizacion: resuelve la deuda exigiendo que la persona usuaria
     * sea deudora o acreedora antes de modificarla. findForUser() responde 404, de
     * modo que una deuda inexistente y una ajena resultan indistinguibles.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateForUser(int $id, int $userId, array $data): GroupDebt
    {
        return $this->update($this->findForUser($id, $userId), $data);
    }

    public function delete(GroupDebt $groupDebt): bool
    {
        if ($groupDebt->status === 'paid') {
            throw new BusinessRuleException(
                'No se puede eliminar una deuda que ya está pagada.',
                'DEUDA_YA_PAGADA',
                409
            );
        }

        return $groupDebt->delete();
    }

    private function validateNotSelfDebt(array $data): void
    {
        if (
            isset($data['debtor_id'], $data['creditor_id'])
            && $data['debtor_id'] === $data['creditor_id']
        ) {
            throw new BusinessRuleException(
                'El deudor y el acreedor no pueden ser el mismo usuario.',
                'DEUDA_ORIGEN_INVALIDO',
                422
            );
        }
    }

    private function validateStatusTransition(GroupDebt $groupDebt, array $data): void
    {
        $newStatus = $data['status'] ?? $groupDebt->status;

        if ($groupDebt->status === 'paid' && $newStatus !== 'paid') {
            throw new BusinessRuleException(
                'No se puede cambiar el estado de una deuda que ya está pagada.',
                'DEUDA_YA_PAGADA',
                409
            );
        }
    }
}
