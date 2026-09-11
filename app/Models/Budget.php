<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'name',
        'category_id',
        'user_id',
        'maxAmount',
        'month',
        'year',
    ];

    protected $casts = [
        'maxAmount' => 'decimal:2',
        'month' => 'integer',
        'year' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
