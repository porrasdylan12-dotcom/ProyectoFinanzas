<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    use HasFactory;

    protected $table = 'groups';

    protected $fillable = [
        'name',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'user_group',
            'group_id',
            'user_id'
        )
        ->withPivot('role', 'joined_at')
        ->withTimestamps();
    }

    public function sharedExpenses(): HasMany
    {
        return $this->hasMany(SharedExpenses::class);
    }
}