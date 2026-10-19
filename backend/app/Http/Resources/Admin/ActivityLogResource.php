<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// TODO: see Rancangan-API-Padindi.md & Struktur-Folder-Padindi.md section 2
class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }
}
