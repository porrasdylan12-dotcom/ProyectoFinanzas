<?php

namespace App\Models;

use Database\Factories\SharedExpensesFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SharedExpenses extends Model
{
    /** @use HasFactory<SharedExpensesFactory> */
    use HasFactory;

    protected $table = 'shared_expenses';

    protected $fillable = [
        'group_id',
        'user_id',
        'amount',
        'description',
        'date',
        'participants',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date',
        'participants' => 'array',
    ];

    /** @return BelongsTo<Group, $this> */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<GroupDebt, $this> */
    public function debts(): HasMany
    {
        return $this->hasMany(
            GroupDebt::class,
            'shared_expense_id'
        );
    }
}
