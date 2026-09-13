<?php

namespace App\Http\Controllers;

use App\Http\Requests\GroupRequest;
use App\Services\GroupService;

class GroupController extends Controller
{
    public function __construct(public GroupService $groupService)
    {
        $this->groupService = $groupService;
    }

    /**
     * Display a listing of the groups.
     */
    public function index()
    {
        return view('groups.index');
    }

    /**
     * Store a newly created group.
     */
    public function store(GroupRequest $request)
    {
        $this->groupService->create($request->validated());

        return redirect()
            ->route('groups.index')
            ->with('success', 'Grupo creado correctamente.');
    }
}