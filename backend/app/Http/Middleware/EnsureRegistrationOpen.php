<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// TODO: see Rancangan-API-Padindi.md section 2.2 & 5.2
class EnsureRegistrationOpen
{
    public function handle(Request $request, Closure $next): Response
    {
        // TODO: Cek apakah periode pendaftaran aktif dan masih dalam rentang waktu opens_at - closes_at
        return $next($request);
    }
}
