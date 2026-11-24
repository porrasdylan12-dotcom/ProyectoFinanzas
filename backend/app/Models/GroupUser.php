<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Carbon;

/**
 * @property int $group_id
 * @property int $user_id
 * @property string $role
 * @property Carbon|null $joined_at
 */
class GroupUser extends Pivot {}
