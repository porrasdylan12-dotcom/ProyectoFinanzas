<?php

namespace App\Services;

use App\Models\GroupDebt;
use App\Models\SharedExpenses;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class SharedExpensesService
{
    private const MAX_PAGE_SIZE = 50;

    private const SORTABLE_FIELDS = ['date', 'amount', 'created_at'];

    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = SharedExpenses::query()->with(['group', 'user', 'debts']);

        if (! empty($filters['group_id'])) {
            $query->where('group_id', $filters['group_id']);
        }

        if (! empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (! empty($filters['from'])) {
            $query->where('date', '>=', $filters['from']);
        }

        if (! empty($filters['to'])) {
            $query->where('date', '<=', $filters['to']);
        }

        $sortBy = $filters['sort_by'] ?? 'date';
        $sortDir = $filters['sort_dir'] ?? 'desc';

        if (! in_array($sortBy, self::SORTABLE_FIELDS)) {
            $sortBy = 'date';
        }

        $sortDir = strtolower($sortDir) === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) ($filters['per_page'] ?? 15), self::MAX_PAGE_SIZE);

        return $query->paginate($perPage);
    }

    public function findForUser(int $id, int $userId): SharedExpenses
    {
        return SharedExpenses::where('id', $id)
            ->where(function (Builder $query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhereHas('group.users', function (Builder $q) use ($userId) {
                        $q->where('user_id', $userId);
                    });
            })
            ->firstOrFail();
    }

    public function create(array $data): SharedExpenses
    {
        return DB::transaction(function () use ($data) {
            $expense = SharedExpenses::create($data);

            $this->generateDebts($expense);

            return $expense;
        });
    }

    public function update(SharedExpenses $sharedExpense, array $data): SharedExpenses
    {
        $sharedExpense->update($data);

        return $sharedExpense;
    }

    /**
     * Capa 2 de autorizacion: resuelve el gasto compartido exigiendo que la persona
     * usuaria lo haya pagado o pertenezca al grupo antes de modificarlo.
     * findForUser() responde 404, de modo que un gasto inexistente y uno ajeno
     * resultan indistinguibles.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateForUser(int $id, int $userId, array $data): SharedExpenses
    {
        return $this->update($this->findForUser($id, $userId), $data);
    }

    public function delete(SharedExpenses $sharedExpense): bool
    {
        return $sharedExpense->delete();
    }

    private function generateDebts(SharedExpenses $expense): void
    {
        $participants = $expense->participants ?? [];

        if (count($participants) < 2) {
            return;
        }

        $share = round((float) $expense->amount / count($participants), 2);

        foreach ($participants as $participantId) {
            if ((int) $participantId === (int) $expense->user_id) {
                continue;
            }

            GroupDebt::create([
                'shared_expense_id' => $expense->id,
                'debtor_id' => $participantId,
                'creditor_id' => $expense->user_id,
                'name' => 'Deuda por gasto compartido',
                'description' => $expense->description,
                'total_amount' => $share,
                'status' => 'pending',
            ]);
        }
    }
}
