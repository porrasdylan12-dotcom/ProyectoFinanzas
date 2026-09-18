<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CategoryService
{
    private const MAX_PAGE_SIZE = 50;

    private const SORTABLE_FIELDS = ['name', 'type', 'created_at'];

    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Category::query()->with(['transactions', 'budgets']);

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

        $secondSort = $sortBy === 'name' ? 'type' : 'name';
        $query->orderBy($secondSort, 'asc');

        $perPage = min((int) ($filters['per_page'] ?? 15), self::MAX_PAGE_SIZE);

        return $query->paginate($perPage);
    }

    public function findForUser(int $id, int $userId): Category
    {
        return Category::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    public function create(array $data): Category
    {
        return Category::create($data);
    }

    public function update(Category $category, array $data): Category
    {
        $category->update($data);

        return $category;
    }

    public function delete(Category $category): bool
    {
        return DB::transaction(function () use ($category) {
            if ($category->transactions()->exists()) {
                throw new BusinessRuleException(
                    'No se puede eliminar la categoría porque tiene transacciones asociadas.',
                    'CATEGORIA_CON_TRANSACCIONES',
                    409
                );
            }

            return $category->delete();
        });
    }
}
