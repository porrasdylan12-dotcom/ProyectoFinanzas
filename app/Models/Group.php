<?php

namespace App\Models;

use Database\Factories\GroupFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    /** @use HasFactory<GroupFactory> */
    use HasFactory;

    protected $table = 'groups';

    protected $fillable = [
        'name',
    ];

    /**
     * @return BelongsToMany<User, $this, GroupUser>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'user_group',
            'group_id',
            'user_id'
        )
            ->using(GroupUser::class)
            ->withPivot('role', 'joined_at')
            ->withTimestamps();
    }

    /** @return HasMany<SharedExpenses, $this> */
    public function sharedExpenses(): HasMany
    {
        return $this->hasMany(SharedExpenses::class);
    }
}
