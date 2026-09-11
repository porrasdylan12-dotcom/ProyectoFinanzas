<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupDebt extends Model
{
    use HasFactory;

    protected $table = 'group_debts';

    protected $fillable = [
        'shared_expense_id',
        'debtor_id',
        'creditor_id',
        'name',
        'description',
        'total_amount',
        'status',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    public function sharedExpense(): BelongsTo
    {
        return $this->belongsTo(
            SharedExpenses::class,
            'shared_expense_id'
        );
    }

    public function debtor(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'debtor_id'
        );
    }

    public function creditor(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'creditor_id'
        );
    }
}