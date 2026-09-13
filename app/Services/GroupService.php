<?php

namespace App\Services;

use App\Models\Group;

class GroupService
{
    /**
     * Create a new group.
     */
    public function create(array $data): Group
    {
        return Group::create($data);
    }

    /**
     * Update a group.
     */
    public function update(Group $group, array $data): Group
    {
        $group->update($data);

        return $group;
    }
}
