<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// TODO: see Skema-Database-Padindi.md section 3.6
class GalleryItem extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    // TODO: relasi gallery()
}
