<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Group;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class GroupService
{
    private const MAX_PAGE_SIZE = 50;

    private const SORTABLE_FIELDS = ['name', 'created_at'];

    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, Group>
     */
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

    /**
     * @param  array<string, mixed>  $data
     */
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

    /**
     * Incorpora a una persona al grupo por su correo. Solo el anfitrion (rol
     * 'admin' del pivote user_group) puede administrar la composicion del grupo;
     * las personas invitadas solo pueden registrar gastos y deudas.
     */
    public function addMember(Group $group, int $userId, string $email): Group
    {
        $membership = $group->users()->where('user_id', $userId)->first();

        if (! $membership || $membership->pivot->role !== 'admin') {
            throw new AuthorizationException(
                'Solo el anfitrión del grupo puede añadir integrantes.'
            );
        }

        $usuario = User::where('email', $email)->firstOrFail();

        if ($group->users()->where('user_id', $usuario->id)->exists()) {
            throw new BusinessRuleException(
                'La persona ya pertenece al grupo.',
                'YA_ES_MIEMBRO',
                409
            );
        }

        $group->users()->attach($usuario->id, [
            'role' => 'member',
            'joined_at' => now(),
        ]);

        return $group;
    }

    /**
     * @param  array<string, mixed>  $data
     */
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
