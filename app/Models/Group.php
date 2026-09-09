<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    /** @use HasFactory<\Database\Factories\GroupFactory> */
    use HasFactory;

    protected $fillable = [
        'id',
        'name',
    ];

    protected $hidden = [

    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_group', 'group_id', 'user_id');
    }

    protected $table = 'group';
}