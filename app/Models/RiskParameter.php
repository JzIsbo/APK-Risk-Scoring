<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiskParameter extends Model
{
    protected $fillable = ['key', 'name', 'weight', 'criteria'];

    protected $casts = [
        'criteria' => 'array',
        'weight' => 'float',
    ];
}
