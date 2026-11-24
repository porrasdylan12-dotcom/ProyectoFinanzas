<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Budget;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class BudgetService
{
    private const MAX_PAGE_SIZE = 50;

    private const SORTABLE_FIELDS = ['name', 'maxAmount', 'month', 'year', 'created_at'];

    private const DISCOUNT_THRESHOLD = 500000;

    private const DISCOUNT_PERCENTAGE = 10;

    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, Budget>
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Budget::query()->with('category');

        if (! empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['month'])) {
            $query->where('month', $filters['month']);
        }

        if (! empty($filters['year'])) {
            $query->where('year', $filters['year']);
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

        $secondSort = $sortBy === 'name' ? 'maxAmount' : 'name';
        $query->orderBy($secondSort, 'asc');

        $perPage = min((int) ($filters['per_page'] ?? 15), self::MAX_PAGE_SIZE);

        return $query->paginate($perPage);
    }

    public function findForUser(int $id, int $userId): Budget
    {
        return Budget::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Budget
    {
        $this->validateNotRetroactive($data);
        $data = $this->applyDiscountIfApplicable($data);

        return DB::transaction(function () use ($data) {
            return Budget::create($data);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Budget $budget, array $data): Budget
    {
        $data = $this->applyDiscountIfApplicable($data);

        $budget->update($data);

        return $budget;
    }

    /**
     * Capa 2 de autorizacion: resuelve el presupuesto exigiendo que pertenezca a
     * la persona usuaria antes de modificarlo. findForUser() responde 404, de
     * modo que un presupuesto inexistente y uno ajeno resultan indistinguibles.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateForUser(int $id, int $userId, array $data): Budget
    {
        return $this->update($this->findForUser($id, $userId), $data);
    }

    public function delete(Budget $budget): bool
    {
        return $budget->delete();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function validateNotRetroactive(array $data): void
    {
        $now = Carbon::now();
        $budgetYear = (int) ($data['year'] ?? 0);
        $budgetMonth = (int) ($data['month'] ?? 0);

        $budgetDate = Carbon::createFromDate($budgetYear, $budgetMonth, 1)->startOfMonth();
        $currentMonth = $now->copy()->startOfMonth();

        if ($budgetDate->lt($currentMonth)) {
            throw new BusinessRuleException(
                'No se puede crear un presupuesto para un período que ya ha pasado.',
                'PRESUPUESTO_RETROACTIVO',
                422
            );
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function applyDiscountIfApplicable(array $data): array
    {
        $maxAmount = (float) ($data['maxAmount'] ?? 0);

        if ($maxAmount > self::DISCOUNT_THRESHOLD) {
            $discount = $maxAmount * (self::DISCOUNT_PERCENTAGE / 100);
            $data['maxAmount'] = round($maxAmount - $discount, 2);
        }

        return $data;
    }
}
