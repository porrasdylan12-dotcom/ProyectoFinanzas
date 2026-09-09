<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SharedExpenses extends Model
{
    use HasFactory;

    protected $table = 'shared_expenses';

    protected $fillable = [
        'id',
        'group_id',
        'user_id',
        'amount',
        'description',
        'date',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'participants' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
}
