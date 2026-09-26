<?php

namespace App\Http\Controllers;

use App\Http\Requests\GroupRequest;
use App\Http\Resources\GroupResource;
use App\Models\Group;
use App\Services\GroupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Attributes\Controllers\Authorize;

class GroupController extends Controller
{
    public function __construct(public GroupService $groupService)
    {
        $this->groupService = $groupService;
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->all();
        $filters['user_id'] = $request->user()->id;

        return GroupResource::collection($this->groupService->list($filters));
    }

    #[Authorize('create', Group::class)]
    public function store(GroupRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['owner_id'] = $request->user()->id;

        $group = $this->groupService->create($data);

        return (new GroupResource($group))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('api.groups.show', $group));
    }

    #[Authorize('view', 'group')]
    public function show(Request $request, Group $group): GroupResource
    {
        $group = $this->groupService->findForUser($group->id, $request->user()->id);

        return new GroupResource($group);
    }

    #[Authorize('update', 'group')]
    public function update(GroupRequest $request, Group $group): GroupResource
    {
        $group->load('users');
        $group = $this->groupService->update($group, $request->validated());

        return new GroupResource($group);
    }

    #[Authorize('delete', 'group')]
    public function destroy(Request $request, Group $group): JsonResponse
    {
        $group = $this->groupService->findForUser($group->id, $request->user()->id);
        $this->groupService->delete($group, $request->user()->id);

        return response()->json(null, 204);
    }
}
