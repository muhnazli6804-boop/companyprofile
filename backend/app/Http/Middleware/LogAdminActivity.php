<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// TODO: see Rancangan-API-Padindi.md section 11.3 & Skema-Database-Padindi.md section 3.7
class LogAdminActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // TODO: Simpan log aktivitas admin setelah request selesai diproses

        return $response;
    }
}
