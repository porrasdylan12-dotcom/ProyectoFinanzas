<?php

namespace App\Services;

use App\Models\Group;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class GroupService
{
    private const MAX_PAGE_SIZE = 50;

    private const SORTABLE_FIELDS = ['name', 'created_at'];

    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Group::query()->with('users');

        if (! empty($filters['name'])) {
            $query->where('name', 'like', '%'.$filters['name'].'%');
        }

        if (! empty($filters['user_id'])) {
            $query->whereHas('users', function (Builder $q) use ($filters) {
                $q->where('user_id', $filters['user_id']);
            });
        }

        $sortBy = $filters['sort_by'] ?? 'name';
        $sortDir = $filters['sort_dir'] ?? 'asc';

        if (! in_array($sortBy, self::SORTABLE_FIELDS)) {
            $sortBy = 'name';
        }

        $sortDir = strtolower($sortDir) === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) ($filters['per_page'] ?? 15), self::MAX_PAGE_SIZE);

        return $query->paginate($perPage);
    }

    public function findForUser(int $id, int $userId): Group
    {
        return Group::where('id', $id)
            ->whereHas('users', function (Builder $q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->firstOrFail();
    }

    public function create(array $data): Group
    {
        $ownerId = (int) ($data['owner_id'] ?? 0);
        unset($data['owner_id']);

        return DB::transaction(function () use ($data, $ownerId) {
            $group = Group::create($data);

            $group->users()->attach($ownerId, [
                'role' => 'admin',
                'joined_at' => now(),
            ]);

            return $group;
        });
    }

    public function update(Group $group, array $data): Group
    {
        $group->update($data);

        return $group;
    }

    /**
     * Capa 2 de autorizacion: resuelve el grupo exigiendo que la persona usuaria
     * sea miembro antes de modificarlo. findForUser() responde 404, de modo que un
     * grupo inexistente y uno ajeno resultan indistinguibles.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateForUser(int $id, int $userId, array $data): Group
    {
        return $this->update($this->findForUser($id, $userId), $data);
    }

    public function delete(Group $group, int $userId): bool
    {
        $membership = $group->users()->where('user_id', $userId)->first();

        if (! $membership || $membership->pivot->role !== 'admin') {
            throw new AuthorizationException(
                'No tienes permisos para eliminar este grupo.'
            );
        }

        return $group->delete();
    }
}
