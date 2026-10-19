<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

// TODO: see Skema-Database-Padindi.md section 3.6
class PostCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    // TODO: relasi posts()
}
